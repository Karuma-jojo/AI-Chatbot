
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { seedDatabase } from "./lib/seed";
import { matchInternships } from "./lib/recommender";
import { getInsights } from "./lib/insights";
import { searchParamsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  await seedDatabase();

  app.post(api.internships.match.path, async (req, res) => {
    try {
      const params = searchParamsSchema.parse(req.body);
      const results = await matchInternships(params);
      res.json(results);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid search params" });
      } else {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.internships.list.path, async (req, res) => {
    const all = await storage.getAllInternships();
    res.json(all);
  });

  app.get(api.insights.get.path, async (req, res) => {
    try {
      const stats = await getInsights();
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  return httpServer;
}
