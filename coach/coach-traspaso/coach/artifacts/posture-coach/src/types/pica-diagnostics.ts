export type PicaDiagBucket = {
  second: number;
  presented: number;
  presentedSource: string;
  dropped: number;
  runFrame: number;
  poseRequested: number;
  poseReturned: number;
  evaluated: number;
  detectorMsTotal: number;
  detectorMsCount: number;
  detectorMsMax: number;
  skipped: Record<string, { count: number; values: string }>;
  counting: boolean;
  reported: boolean;
};

export type PicaDiagBucketsRef = { current: Record<string, PicaDiagBucket> };

export type PicaRangosSample = {
  tVideoS: number;
  lecturasGrados: Record<string, number | null>;
  repetitionAngle: number | null;
  elevacionCadera: number | null;
  frameMeasurementBlocked: boolean;
};
