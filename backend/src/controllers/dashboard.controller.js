import { count, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { tickets, users } from "../../drizzle/schema.ts";
import { sendServerError } from "../middleware/error.middleware.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [userCounts, ticketCounts, unassignedCount, staffCount] = await Promise.all([
      db
        .select({
          role: users.role,
          total: count(users.userid),
        })
        .from(users)
        .groupBy(users.role),
      db
        .select({
          status: tickets.status,
          total: count(tickets.ticketid),
        })
        .from(tickets)
        .groupBy(tickets.status),
      db
        .select({
          total: count(tickets.ticketid),
        })
        .from(tickets)
        .where(isNull(tickets.assignedto)),
      db
        .select({
          total: count(users.userid),
        })
        .from(users)
        .where(eq(users.role, "staff")),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        userCounts: userCounts,
        ticketCounts : ticketCounts,
        unassignedCount : unassignedCount,
        staffCount : staffCount,
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Load admin dashboard failed",
      "Unable to load dashboard data right now. Please try again.",
    );
  }
};

export const getStaffDashboard = async (req, res) => {
  try {
    const staffId = Number(req.user.userId);
    const [statusResults, priorityResults] = await Promise.all([
      db
        .select({
          status: tickets.status,
          total: count(tickets.ticketid),
        })
        .from(tickets)
        .where(eq(tickets.assignedto, staffId))
        .groupBy(tickets.status),
      db
        .select({
          priority: tickets.priority,
          total: count(tickets.ticketid),
        })
        .from(tickets)
        .where(eq(tickets.assignedto, staffId))
        .groupBy(tickets.priority),
    ]);

    const statusCounts = {
      open: 0,
      in_progress: 0,
      waiting_for_user: 0,
      resolved: 0,
      closed: 0,
    };
    const priorityCounts = {
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const result of statusResults) {
      if (Object.hasOwn(statusCounts, result.status)) {
        statusCounts[result.status] = Number(result.total);
      }
    }

    for (const result of priorityResults) {
      const priority = result.priority.toLowerCase();

      if (Object.hasOwn(priorityCounts, priority)) {
        priorityCounts[priority] = Number(result.total);
      }
    }

    const totalTickets = Object.values(statusCounts).reduce(
      (total, ticketCount) => total + ticketCount,
      0,
    );

    return res.status(200).json({
      success: true,
      data: {
        totalTickets,
        statusCounts,
        priorityCounts,
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Load staff dashboard failed",
      "Unable to load your ticket summary right now. Please try again.",
    );
  }
};
