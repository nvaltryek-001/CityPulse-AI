import {
  defineConfig
} from "@playwright/test";

export default defineConfig({

  testDir: "./e2e",

  testMatch: "**/*.spec.js",

  timeout: 90000,

  expect: {
    timeout: 20000
  },

  fullyParallel: false,

  workers: 1,

  reporter: [
    ["list"],
    [
      "html",
      {
        outputFolder: "e2e-report",
        open: "never"
      }
    ]
  ],

  use: {

    baseURL:
      "http://127.0.0.1:5173",

    channel:
      "chrome",

    trace:
      "retain-on-failure",

    screenshot:
      "only-on-failure",

    video:
      "retain-on-failure",

    viewport: {
      width: 1440,
      height: 900
    }

  },

  webServer: {

    command:
      "npm run dev -- --host 127.0.0.1 --port 5173",

    url:
      "http://127.0.0.1:5173/",

    timeout:
      120000,

    reuseExistingServer:
      true,

    stdout:
      "pipe",

    stderr:
      "pipe"

  }

});
