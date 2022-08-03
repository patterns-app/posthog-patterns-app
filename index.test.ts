import {
  createEvent,
  getMeta,
  resetMeta,
} from "@posthog/plugin-scaffold/test/utils";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

import { exportEvents } from "./index";

beforeEach(() => {
  resetMeta({
    config: {
      webhookUrl: "https://api-staging.patterns.app/api/app/webhooks/wh1234",
    },
  });
  fetchMock.resetMocks();
});

test("exportEvents", async () => {
  const event = createEvent({ event: "$pageView" });

  // @ts-ignore
  await exportEvents([event], getMeta());

  expect(fetchMock.mock.calls.length).toEqual(1);
  expect(fetchMock.mock.calls[0][0]).toEqual(getMeta().config.webhookUrl);
  expect(fetchMock.mock.calls[0][1]).toEqual({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([event]),
  });
});
