import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  monitoringTargets, 
  monitoringChecks, 
  uptimeHistory,
  incidents,
  InsertMonitoringTarget,
  InsertMonitoringCheck,
  InsertUptimeHistory,
  InsertIncident
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Monitoring Targets - CRUD operations
 */
export async function getAllTargets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(monitoringTargets).where(eq(monitoringTargets.isActive, 1));
}

export async function getTargetById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(monitoringTargets).where(eq(monitoringTargets.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTarget(target: InsertMonitoringTarget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(monitoringTargets).values(target);
  return result;
}

export async function updateTarget(id: number, target: Partial<InsertMonitoringTarget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(monitoringTargets).set(target).where(eq(monitoringTargets.id, id));
}

export async function deleteTarget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(monitoringTargets).where(eq(monitoringTargets.id, id));
}

/**
 * Monitoring Checks - Store check results
 */
export async function createCheck(check: InsertMonitoringCheck) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(monitoringChecks).values(check);
}

export async function getChecksByTargetId(targetId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(monitoringChecks)
    .where(eq(monitoringChecks.targetId, targetId))
    .orderBy(desc(monitoringChecks.checkedAt))
    .limit(limit);
}

export async function getRecentChecksByTargetId(targetId: number, hoursBack: number = 24) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  return db
    .select()
    .from(monitoringChecks)
    .where(and(
      eq(monitoringChecks.targetId, targetId),
      gte(monitoringChecks.checkedAt, since)
    ))
    .orderBy(desc(monitoringChecks.checkedAt));
}

/**
 * Uptime History - Aggregated statistics
 */
export async function createUptimeRecord(record: InsertUptimeHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(uptimeHistory).values(record);
}

export async function getUptimeHistoryByTargetId(targetId: number, period: "daily" | "hourly" = "daily", daysBack: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  return db
    .select()
    .from(uptimeHistory)
    .where(and(
      eq(uptimeHistory.targetId, targetId),
      eq(uptimeHistory.period, period),
      gte(uptimeHistory.timestamp, since)
    ))
    .orderBy(desc(uptimeHistory.timestamp));
}

/**
 * Incidents - Track downtime events
 */
export async function createIncident(incident: InsertIncident) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(incidents).values(incident);
}

export async function getIncidentsByTargetId(targetId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(incidents)
    .where(eq(incidents.targetId, targetId))
    .orderBy(desc(incidents.startTime))
    .limit(limit);
}

export async function updateIncident(id: number, incident: Partial<InsertIncident>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(incidents).set(incident).where(eq(incidents.id, id));
}

/**
 * Statistics - Calculate uptime metrics
 */
export async function calculateTargetUptime(targetId: number, hoursBack: number = 24) {
  const db = await getDb();
  if (!db) return null;
  
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  const checks = await db
    .select()
    .from(monitoringChecks)
    .where(and(
      eq(monitoringChecks.targetId, targetId),
      gte(monitoringChecks.checkedAt, since)
    ));

  if (checks.length === 0) return null;

  const successful = checks.filter(c => c.isSuccess === 1).length;
  const total = checks.length;
  const uptimePercentage = (successful / total) * 100;
  const avgResponseTime = checks.reduce((sum, c) => sum + (c.responseTime || 0), 0) / total;

  return {
    targetId,
    totalChecks: total,
    successfulChecks: successful,
    uptimePercentage: parseFloat(uptimePercentage.toFixed(2)),
    averageResponseTime: Math.round(avgResponseTime),
  };
}

export async function getTargetStatus(targetId: number) {
  const db = await getDb();
  if (!db) return null;

  const lastCheck = await db
    .select()
    .from(monitoringChecks)
    .where(eq(monitoringChecks.targetId, targetId))
    .orderBy(desc(monitoringChecks.checkedAt))
    .limit(1);

  if (lastCheck.length === 0) return null;

  return {
    targetId,
    isOnline: lastCheck[0].isSuccess === 1,
    lastCheckTime: lastCheck[0].checkedAt,
    statusCode: lastCheck[0].statusCode,
    responseTime: lastCheck[0].responseTime,
    errorMessage: lastCheck[0].errorMessage,
  };
}
