import type { Express } from "express";

/**
 * OAuth routes disabled for public API
 * This application does not require authentication
 */
export function registerOAuthRoutes(app: Express) {
  // OAuth routes are disabled for this public monitoring service
  app.get("/api/oauth/callback", (req, res) => {
    res.status(404).json({ error: "OAuth not available for this application" });
  });
}
