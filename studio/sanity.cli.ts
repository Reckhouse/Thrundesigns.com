import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "fbuy6kak",
    dataset: "production",
  },
  studioHost: "thrundesign",
  deployment: {
    appId: "s90ma13g7u6u98ahd7kgpwwm",
    autoUpdates: true,
  },
});
