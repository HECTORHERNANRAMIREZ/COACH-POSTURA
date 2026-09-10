import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const billingSubscriptionsTable = pgTable(
  "billing_subscriptions",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    lemonSubscriptionId: text("lemon_subscription_id").notNull(),
    lemonCustomerId: text("lemon_customer_id"),
    lemonOrderId: text("lemon_order_id"),
    productId: text("product_id"),
    variantId: text("variant_id"),
    userEmail: text("user_email"),
    status: text("status").notNull().default("none"),
    isActive: boolean("is_active").notNull().default(false),
    renewsAt: timestamp("renews_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    clerkUserIdUnique: uniqueIndex("billing_subscriptions_clerk_user_id_unique").on(
      table.clerkUserId,
    ),
    lemonSubscriptionIdUnique: uniqueIndex(
      "billing_subscriptions_lemon_subscription_id_unique",
    ).on(table.lemonSubscriptionId),
  }),
);

export const insertBillingSubscriptionSchema = createInsertSchema(
  billingSubscriptionsTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBillingSubscription = z.infer<
  typeof insertBillingSubscriptionSchema
>;
export type BillingSubscription = typeof billingSubscriptionsTable.$inferSelect;