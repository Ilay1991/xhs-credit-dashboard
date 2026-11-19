import cron from "node-cron";

export function scheduleDaily(task) {
  return cron.schedule("30 10 * * 1-5", task, { timezone: "Asia/Shanghai", noOverlap: true });
}
