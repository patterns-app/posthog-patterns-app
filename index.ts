import {
  PluginInput,
  Plugin,
  Meta,
  RetryError,
  PluginEvent,
} from "@posthog/plugin-scaffold";
import fetch, { Response } from "node-fetch";

export interface PatternsPluginInput extends PluginInput {
  config: {
    webhookUrl: string;
  };
}

// Plugin method that runs on plugin load
//@ts-ignore
export async function setupPlugin({ config }: Meta<PatternsPluginInput>) {
  console.log("Loaded Patterns app.");
}

// Plugin method to export events
export async function exportEvents(events: any, { config }: any) {
  console.log(
    `Exporting events to Patterns webhook... ${events.length} events`
  );

  let response: Response;
  response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events),
  });

  if (response.status != 200) {
    const data = await response.json();
    throw new RetryError(`Export events failed: ${JSON.stringify(data)}`);
  }
  console.log("Export Success.");
}
