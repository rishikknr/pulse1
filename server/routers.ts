import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  // Monitoring Targets - Public API
  targets: router({
    // Get all active monitoring targets
    list: publicProcedure.query(async () => {
      return db.getAllTargets();
    }),

    // Get a specific target by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTargetById(input.id);
      }),

    // Create a new monitoring target
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          url: z.string().url(),
          description: z.string().optional(),
          method: z.string().default("GET"),
          checkInterval: z.number().default(300),
          timeout: z.number().default(10),
          expectedStatusCode: z.number().default(200),
        })
      )
      .mutation(async ({ input }) => {
        return db.createTarget(input);
      }),

    // Update a monitoring target
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          url: z.string().url().optional(),
          description: z.string().optional(),
          checkInterval: z.number().optional(),
          timeout: z.number().optional(),
          expectedStatusCode: z.number().optional(),
          isActive: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return db.updateTarget(id, updates);
      }),

    // Delete a monitoring target
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteTarget(input.id);
      }),
  }),

  // Monitoring Checks - Public API
  checks: router({
    // Get recent checks for a target
    getByTargetId: publicProcedure
      .input(
        z.object({
          targetId: z.number(),
          limit: z.number().default(100),
        })
      )
      .query(async ({ input }) => {
        return db.getChecksByTargetId(input.targetId, input.limit);
      }),

    // Get checks from the last N hours
    getRecent: publicProcedure
      .input(
        z.object({
          targetId: z.number(),
          hoursBack: z.number().default(24),
        })
      )
      .query(async ({ input }) => {
        return db.getRecentChecksByTargetId(input.targetId, input.hoursBack);
      }),

    // Record a new check result
    create: publicProcedure
      .input(
        z.object({
          targetId: z.number(),
          statusCode: z.number().optional(),
          responseTime: z.number().optional(),
          isSuccess: z.number(),
          errorMessage: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createCheck(input);
      }),
  }),

  // Uptime History - Public API
  history: router({
    // Get uptime history for a target
    getByTargetId: publicProcedure
      .input(
        z.object({
          targetId: z.number(),
          period: z.enum(["daily", "hourly"]).default("daily"),
          daysBack: z.number().default(30),
        })
      )
      .query(async ({ input }) => {
        return db.getUptimeHistoryByTargetId(
          input.targetId,
          input.period,
          input.daysBack
        );
      }),

    // Create uptime history record
    create: publicProcedure
      .input(
        z.object({
          targetId: z.number(),
          period: z.enum(["daily", "hourly"]),
          timestamp: z.date(),
          totalChecks: z.number(),
          successfulChecks: z.number(),
          uptimePercentage: z.string(),
          averageResponseTime: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createUptimeRecord(input);
      }),
  }),

  // Statistics - Public API
  stats: router({
    // Calculate uptime for a target
    getUptime: publicProcedure
      .input(
        z.object({
          targetId: z.number(),
          hoursBack: z.number().default(24),
        })
      )
      .query(async ({ input }) => {
        return db.calculateTargetUptime(input.targetId, input.hoursBack);
      }),

    // Get current status of a target
    getStatus: publicProcedure
      .input(z.object({ targetId: z.number() }))
      .query(async ({ input }) => {
        return db.getTargetStatus(input.targetId);
      }),

    // Get status for all targets
    getAllStatus: publicProcedure.query(async () => {
      const targets = await db.getAllTargets();
      const statuses = await Promise.all(
        targets.map((t) => db.getTargetStatus(t.id))
      );
      return statuses.filter((s) => s !== null);
    }),
  }),

  // Incidents - Public API
  incidents: router({
    // Get incidents for a target
    getByTargetId: publicProcedure
      .input(
        z.object({
          targetId: z.number(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        return db.getIncidentsByTargetId(input.targetId, input.limit);
      }),

    // Create an incident
    create: publicProcedure
      .input(
        z.object({
          targetId: z.number(),
          startTime: z.date(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createIncident({
          targetId: input.targetId,
          startTime: input.startTime,
          reason: input.reason,
          status: "ongoing",
        });
      }),

    // Resolve an incident
    resolve: publicProcedure
      .input(
        z.object({
          id: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateIncident(input.id, {
          status: "resolved",
          endTime: new Date(),
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
