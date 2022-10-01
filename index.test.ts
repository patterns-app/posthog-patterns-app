import {
  createEvent,
  getMeta,
  resetMeta,
} from "@posthog/plugin-scaffold/test/utils";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

import { exportEvents } from "./index";

const testWebhookUrl =
  "https://api-staging.patterns.app/api/app/webhooks/wh1234";

beforeEach(() => {
  resetMeta({
    config: {
      webhookUrl: testWebhookUrl,
    },
  });
  fetchMock.resetMocks();
});

test("exportEvents called for events", async () => {
  const event1 = createEvent({ event: "$pageView" });
  const event2 = createEvent({ event: "$pageLeave" });

  // @ts-ignore
  await exportEvents([event1, event2], getMeta());

  expect(fetchMock.mock.calls.length).toEqual(1);
  expect(fetchMock.mock.calls[0][0]).toEqual(getMeta().config.webhookUrl);
  expect(fetchMock.mock.calls[0][1]).toEqual({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([event1, event2]),
  });
});

test("exportEvents called for only allowed events", async () => {
  resetMeta({
    config: {
      webhookUrl: testWebhookUrl,
      allowedEventTypes: "$pageView, $autoCapture, $customEvent1",
    },
  });

  const event1 = createEvent({ event: "$pageView" });
  const event2 = createEvent({ event: "$pageLeave" });
  const event3 = createEvent({ event: "$pageView" });
  const event4 = createEvent({ event: "$autoCapture" });

  // @ts-ignore
  await exportEvents([event1, event2, event3, event4], getMeta());

  expect(fetchMock.mock.calls.length).toEqual(1);
  expect(fetchMock.mock.calls[0][0]).toEqual(getMeta().config.webhookUrl);
  expect(fetchMock.mock.calls[0][1]).toEqual({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([event1, event3, event4]),
  });
});
