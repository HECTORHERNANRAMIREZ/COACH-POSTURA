import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { Router, type IRouter, type Request } from "express";
import { getAuth } from "@clerk/express";
import {
  CreateBillingCheckoutResponse,
  GetBillingStatusResponse,
  ReceiveBillingWebhookResponse,
} from "@workspace/api-zod";
import {
  billingSubscriptionsTable,
  db,
} from "@workspace/db";

const router: IRouter = Router();

type JsonRecord = Record<string, unknown>;

function getAuthenticatedUserId(req: Request): string | null {
  return getAuth(req).userId ?? null;
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parseDate(value: unknown): Date | null {
  const raw = asString(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isActiveSubscription(status: string, endsAt: Date | null): boolean {
  if (status !== "active" && status !== "on_trial") return false;
  return endsAt === null || endsAt.getTime() > Date.now();
}

function getRawBody(req: Request): Buffer | null {
  return Buffer.isBuffer(req.body) ? req.body : null;
}

function isValidSignature(rawBody: Buffer, signature: string | undefined): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");
  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

async function createCheckout(userId: string): Promise<string> {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!storeId || !variantId || !apiKey) {
    throw new Error("Lemon Squeezy billing is not configured");
  }

  const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              user_id: userId,
            },
          },
          checkout_options: {
            embed: false,
          },
        },
        relationships: {
          store: {
            data: { type: "stores", id: storeId },
          },
          variant: {
            data: { type: "variants", id: variantId },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Lemon Squeezy checkout failed with ${response.status}`);
  }

  const payload = asRecord(await response.json());
  const data = asRecord(payload?.data);
  const attributes = asRecord(data?.attributes);
  const checkoutUrl = asString(attributes?.url);
  if (!checkoutUrl) throw new Error("Lemon Squeezy returned no checkout URL");
  return checkoutUrl;
}

router.get("/billing/status", async (req, res): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const [subscription] = await db
    .select()
    .from(billingSubscriptionsTable)
    .where(eq(billingSubscriptionsTable.clerkUserId, userId))
    .limit(1);

  const response = GetBillingStatusResponse.parse({
    isActive: subscription?.isActive ?? false,
    status: subscription?.status ?? "none",
    subscriptionId: subscription?.lemonSubscriptionId ?? null,
    renewsAt: subscription?.renewsAt?.toISOString() ?? null,
    endsAt: subscription?.endsAt?.toISOString() ?? null,
  });
  res.json(response);
});

router.post("/billing/checkout", async (req, res): Promise<void> => {
  const userId = getAuthenticatedUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const checkoutUrl = await createCheckout(userId);
    res
      .status(201)
      .json(CreateBillingCheckoutResponse.parse({ checkoutUrl }));
  } catch (error) {
    req.log.error({ err: error }, "Unable to create Lemon Squeezy checkout");
    res.status(502).json({ error: "Unable to create checkout" });
  }
});

router.post("/billing/webhook", async (req, res): Promise<void> => {
  const rawBody = getRawBody(req);
  const signature = Array.isArray(req.headers["x-signature"])
    ? req.headers["x-signature"][0]
    : req.headers["x-signature"];

  if (!rawBody || !isValidSignature(rawBody, signature)) {
    req.log.warn("Rejected Lemon Squeezy webhook signature");
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  let payload: JsonRecord;
  try {
    const parsed = JSON.parse(rawBody.toString("utf8"));
    const record = asRecord(parsed);
    if (!record) throw new Error("Webhook payload is not an object");
    payload = record;
  } catch (error) {
    req.log.warn({ err: error }, "Rejected malformed Lemon Squeezy webhook");
    res.status(400).json({ error: "Invalid webhook payload" });
    return;
  }

  const data = asRecord(payload.data);
  const attributes = asRecord(data?.attributes);
  const meta = asRecord(payload.meta);
  const customData = asRecord(meta?.custom_data);
  const lemonSubscriptionId = asString(data?.id);
  if (!attributes || !lemonSubscriptionId) {
    res.status(200).json(ReceiveBillingWebhookResponse.parse({ received: true }));
    return;
  }

  const existing = await db
    .select()
    .from(billingSubscriptionsTable)
    .where(eq(billingSubscriptionsTable.lemonSubscriptionId, lemonSubscriptionId))
    .limit(1);
  const clerkUserId =
    asString(customData?.user_id) ?? existing[0]?.clerkUserId ?? null;
  if (!clerkUserId) {
    req.log.warn(
      { lemonSubscriptionId },
      "Accepted unlinked Lemon Squeezy subscription webhook",
    );
    res.status(200).json(ReceiveBillingWebhookResponse.parse({ received: true }));
    return;
  }

  const status = asString(attributes.status) ?? "none";
  const endsAt = parseDate(attributes.ends_at);
  const renewsAt = parseDate(attributes.renews_at);
  const subscriptionValues = {
    clerkUserId,
    lemonSubscriptionId,
    lemonCustomerId: asString(attributes.customer_id),
    lemonOrderId: asString(attributes.order_id),
    productId: asString(attributes.product_id),
    variantId: asString(attributes.variant_id),
    userEmail: asString(attributes.user_email),
    status,
    isActive: isActiveSubscription(status, endsAt),
    renewsAt,
    endsAt,
    updatedAt: new Date(),
  };

  await db
    .insert(billingSubscriptionsTable)
    .values(subscriptionValues)
    .onConflictDoUpdate({
      target: billingSubscriptionsTable.clerkUserId,
      set: subscriptionValues,
    });

  res.status(200).json(ReceiveBillingWebhookResponse.parse({ received: true }));
});

export default router;