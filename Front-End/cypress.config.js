// Legacy Cypress configuration; maintained for teams using Cypress separately.
import { defineConfig } from "cypress";
export default defineConfig({ e2e: { baseUrl: "http://localhost:5173", supportFile: false, specPattern: "cypress/e2e/**/*.cy.js", video: false, viewportWidth: 1280, viewportHeight: 800 } });
