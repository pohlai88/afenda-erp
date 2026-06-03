export type CronHealthSurfaceRow = {
  id: string;
  path: string;
  schedule: string;
  status: string;
  lastRun: string;
  duration: string;
  failure: string;
};
