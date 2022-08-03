import {
  createEvent,
  getMeta,
  resetMeta,
} from "@posthog/plugin-scaffold/test/utils";
import "jest";

import { exportEvents } from "./index";

beforeEach(() => {
  resetMeta({
    config: {
      webhookUrl: "https://api-staging.patterns.app/api/app/webhooks/wh1234",
    },
  });
});

test("exportEvents", async () => {
  const event = createEvent({ event: "$identify" });

  await exportEvents([event], getMeta());

  //   expect(fetch).toHaveBeenCalledTimes(1);
});
