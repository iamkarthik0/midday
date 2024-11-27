import { client } from "@midday/jobs";
import { createAppRoute } from "@trigger.dev/nextjs";

export const runtime = "nodejs";
export const maxDuration = 60; // 5min

import "@midday/jobs";

export const { POST, dynamic } = createAppRoute(client);
