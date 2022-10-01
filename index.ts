import {
  PluginInput,
  Plugin,
  Meta,
  RetryError,
  PluginEvent,
} from "@posthog/plugin-scaffold";
import fetch, { Response } from "node-fetch";

type PatternsInputs = {
  webhookUrl: string;
  allowedEventTypes: string;
};

export interface PatternsPluginInput extends PluginInput {
  config: PatternsInputs;
}

const filterEvents = (
  events: PluginEvent[],
  config: PatternsInputs
): PluginEvent[] => {
  if (!config.allowedEventTypes) {
    return events;
  }

  let allowedEventTypes = config.allowedEventTypes.split(",");
  allowedEventTypes = allowedEventTypes.map((eventType) => eventType.trim());

  const allowedEventTypesSet = new Set(allowedEventTypes);

  let filteredEvents = events.filter((event) =>
    allowedEventTypesSet.has(event.event)
  );

  console.log(`"Filtered out ${events.length - filteredEvents.length} events`);

  return filteredEvents;
};

// Plugin method that runs on plugin load
//@ts-ignore
export async function setupPlugin({ config }: Meta<PatternsPluginInput>) {
  console.log("Loaded Patterns app.");
}

// Plugin method to export events
export const exportEvents: Plugin<PatternsPluginInput>["exportEvents"] = async (
  events: PluginEvent[],
  { config }: Meta<PatternsPluginInput>
) => {
  console.log(
    `Exporting events to Patterns webhook... ${events.length} events`
  );

  let filteredEvents = filterEvents(events, config);

  let response: Response;
  response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filteredEvents),
  });

  if (response.status != 200) {
    const data = await response.json();
    throw new RetryError(`Export events failed: ${JSON.stringify(data)}`);
  }
  console.log("Export Success.");
};
