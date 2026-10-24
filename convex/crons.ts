import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 15:00 UTC is 8am Pacific during daylight time, 7am in winter.
crons.daily(
  "comment digest",
  { hourUTC: 15, minuteUTC: 0 },
  internal.digest.sendDaily,
);

export default crons;
