import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Monitoring Targets - URLs/APIs to monitor
 */
export const monitoringTargets = mysqlTable("monitoring_targets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  description: text("description"),
  method: varchar("method", { length: 10 }).default("GET").notNull(), // GET, POST, etc.
  checkInterval: int("checkInterval").default(300).notNull(), // seconds (default 5 min)
  timeout: int("timeout").default(10).notNull(), // seconds
  expectedStatusCode: int("expectedStatusCode").default(200).notNull(),
  isActive: int("isActive").default(1).notNull(), // 1 = true, 0 = false
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonitoringTarget = typeof monitoringTargets.$inferSelect;
export type InsertMonitoringTarget = typeof monitoringTargets.$inferInsert;

/**
 * Monitoring Checks - Individual check results
 */
export const monitoringChecks = mysqlTable("monitoring_checks", {
  id: int("id").autoincrement().primaryKey(),
  targetId: int("targetId").notNull(),
  statusCode: int("statusCode"),
  responseTime: int("responseTime"), // milliseconds
  isSuccess: int("isSuccess").notNull(), // 1 = success, 0 = failure
  errorMessage: text("errorMessage"),
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
});

export type MonitoringCheck = typeof monitoringChecks.$inferSelect;
export type InsertMonitoringCheck = typeof monitoringChecks.$inferInsert;

/**
 * Uptime History - Aggregated daily/hourly statistics
 */
export const uptimeHistory = mysqlTable("uptime_history", {
  id: int("id").autoincrement().primaryKey(),
  targetId: int("targetId").notNull(),
  period: varchar("period", { length: 20 }).notNull(), // "hourly" or "daily"
  timestamp: timestamp("timestamp").notNull(),
  totalChecks: int("totalChecks").default(0).notNull(),
  successfulChecks: int("successfulChecks").default(0).notNull(),
  uptimePercentage: decimal("uptimePercentage", { precision: 5, scale: 2 }).default("100.00").notNull(), // stored as string
  averageResponseTime: int("averageResponseTime"), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UptimeHistory = typeof uptimeHistory.$inferSelect;
export type InsertUptimeHistory = typeof uptimeHistory.$inferInsert;

/**
 * Alerts/Incidents - Track downtime events
 */
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  targetId: int("targetId").notNull(),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime"),
  status: mysqlEnum("status", ["ongoing", "resolved"]).default("ongoing").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;
