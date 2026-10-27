import { and, desc, eq, sql, or, ilike, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db/index.js";
import { tickets, users } from "../../drizzle/schema.ts";
import { sendServerError } from "../middleware/error.middleware.js";

import { redisClient } from "../config/redis.js";
import { invalidateTicketCache } from "../config/redis.js";

const ticketStatusValues = [
  "open",
  "in_progress",
  "waiting_for_user",
  "resolved",
  "closed",
];

const ticketPriorityValues = ["low", "medium", "high"];

function getTicketAccessFilter(user, ticketId) {
  const filters = [eq(tickets.ticketid, Number(ticketId))];

  if (user.role === "staff") {
    filters.push(eq(tickets.assignedto, Number(user.userId)));
  } else if (user.role === "user") {
    filters.push(eq(tickets.customerid, Number(user.userId)));
  }

  return and(...filters);
}

export const getTickets = async (req, res) => {
  try {
    // Create a unique cache key for this user's ticket query.
    const cacheKey = `tickets:v1:${JSON.stringify({
      role: req.user.role,
      userId: req.user.userId,
      search: req.query.search ?? "",
      status: req.query.status ?? "",
      priority: req.query.priority ?? "",
      page: req.query.page ?? "1",
      limit: req.query.limit ?? "10",
      assignedStaff: req.query.assignedStaff ?? "",
    })}`;

    // Check Redis before querying PostgreSQL.
    if (redisClient.isReady) {
      try {
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData !== null) {
          console.log("CACHE HIT:", cacheKey);

          return res.status(200).json(JSON.parse(cachedData));
        }
      } catch (cacheError) {
        console.error("Redis cache read failed:", cacheError.message);
      }
    }

    console.log("CACHE MISS:", cacheKey);

    const {
      search,
      status,
      priority,
      page = "1",
      limit = "10",
      assignedStaff,
    } = req.query;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(limit) || 10, 1);
    const offset = (pageNumber - 1) * pageSize;

    const customer = alias(users, "customer");
    const staff = alias(users, "staff");

    let query = db
      .select({
        ticketid: tickets.ticketid,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,

        customerId: tickets.customerid,
        customerName: customer.name,

        assignedTo: tickets.assignedto,
        staffName: staff.name,

        createdat: tickets.createdat,
      })
      .from(tickets)
      .leftJoin(customer, eq(tickets.customerid, customer.userid))
      .leftJoin(staff, eq(tickets.assignedto, staff.userid));

    const filters = [];

    // Role-based filter
    if (req.user.role === "staff") {
      filters.push(eq(tickets.assignedto, Number(req.user.userId)));
    } else if (req.user.role === "user") {
      filters.push(eq(tickets.customerid, Number(req.user.userId)));
    }

    // Search
    if (search && search.trim() !== "") {
      const searchValue = `%${search.trim()}%`;

      const searchFilters = [
        sql`${tickets.ticketid}::text ILIKE ${searchValue}`,
        ilike(tickets.subject, searchValue),
        ilike(tickets.status, searchValue),
        ilike(tickets.priority, searchValue),
        ilike(customer.name, searchValue),
        ilike(staff.name, searchValue),
      ];

      filters.push(or(...searchFilters));
    }

    // Status filter
    if (status && status.trim() !== "") {
      filters.push(eq(tickets.status, status));
    }

    // Priority filter
    if (priority && priority.trim() !== "") {
      filters.push(eq(tickets.priority, priority));
    }

    // Assigned staff filter
    if (assignedStaff && assignedStaff !== "") {
      if (assignedStaff === "unassigned") {
        filters.push(isNull(tickets.assignedto));
      } else {
        filters.push(eq(tickets.assignedto, Number(assignedStaff)));
      }
    }

    // Apply all filters
    if (filters.length > 0) {
      query = query.where(and(...filters));
    }

    // Ordering + pagination
    const result = await query
      .orderBy(
        sql`
          CASE
            WHEN ${tickets.status} = 'closed' THEN 4
            WHEN ${tickets.priority} = 'high' THEN 1
            WHEN ${tickets.priority} = 'medium' THEN 2
            WHEN ${tickets.priority} = 'low' THEN 3
            ELSE 5
          END
        `,
        desc(tickets.createdat),
      )
      .limit(pageSize)
      .offset(offset);

    const responseData = {
      success: true,
      data: result,
      pagination: {
        page: pageNumber,
        limit: pageSize,
      },
    };

    // Save the result in Redis for 60 seconds.
    if (redisClient.isReady) {
      try {
        await redisClient.setEx(cacheKey, 60, JSON.stringify(responseData));

        console.log("CACHE STORED:", cacheKey);
      } catch (cacheError) {
        console.error("Redis cache write failed:", cacheError.message);
      }
    }

    return res.status(200).json(responseData);

  } catch (error) {
    sendServerError(
      res,
      error,
      "Get tickets failed",
      "Unable to load tickets right now. Please try again.",
    );
  }
};

export const getTicketById = async (req, res) => {
  try {
    const customer = alias(users, "customer");
    const staff = alias(users, "staff");

    const result = await db
      .select()
      .from(tickets)
      .where(getTicketAccessFilter(req.user, req.params.id))
      .leftJoin(customer, eq(tickets.customerid, customer.userid))

      .leftJoin(staff, eq(tickets.assignedto, staff.userid));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Get ticket failed",
      "Unable to load this ticket right now. Please try again.",
    );
  }
};

export const createTicket = async (req, res) => {
  try {
    const { subject, description, priority, status, assignedto } = req.body;

    // Get customer ID from logged-in user's JWT
    const customerId = Number(req.user.userId);

    if (
      !subject?.trim() ||
      !description?.trim() ||
      !Number.isInteger(customerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required",
      });
    }

    let result;

    if (req.params.role === "user") {
      result = await db
        .insert(tickets)
        .values({
          subject,
          description,
          customerid: customerId,
          assignedto: null,
          assignedat: null,
          status: "open",
          priority: "low",
        })
        .returning();
    } else {
      result = await db
        .insert(tickets)
        .values({
          subject,
          description,
          customerid: customerId,
          assignedto: assignedto,
          assignedat: null,
          status: status,
          priority: priority,
        })
        .returning();
    }

    await invalidateTicketCache();

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: result[0],
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Create ticket failed",
      "Unable to create the ticket right now. Please try again.",
    );
  }
};

export const updateTicket = async (req, res) => {
  try {
    const ticketFilter = getTicketAccessFilter(req.user, req.params.id);
    const existingTickets = await db.select().from(tickets).where(ticketFilter);

    if (existingTickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    const ticketData = {};

    if (req.user.role === "admin") {
      const { subject, description, status, priority, assignedto } = req.body;

      if (subject !== undefined) ticketData.subject = subject;
      if (description !== undefined) ticketData.description = description;
      if (status !== undefined) ticketData.status = status;
      if (priority !== undefined) ticketData.priority = priority.toLowerCase();
      if (assignedto !== undefined) {
        ticketData.assignedto = assignedto ? Number(assignedto) : null;
        ticketData.assignedat = assignedto ? new Date().toISOString() : null;
      }
    } else if (req.user.role === "staff") {
      if (req.body.status !== undefined) {
        ticketData.status = req.body.status;
      }
    } else if (req.user.role === "user") {
      if (existingTickets[0].status !== "open") {
        return res.status(403).json({
          success: false,
          message: "Only open tickets can be edited",
        });
      }

      if (req.body.subject !== undefined) ticketData.subject = req.body.subject;
      if (req.body.description !== undefined)
        ticketData.description = req.body.description;
    }

    if (ticketData.status && !ticketStatusValues.includes(ticketData.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    if (
      ticketData.priority &&
      !ticketPriorityValues.includes(ticketData.priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket priority",
      });
    }

    if (Object.keys(ticketData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No ticket fields provided",
      });
    }

    const result = await db
      .update(tickets)
      .set(ticketData)
      .where(ticketFilter)
      .returning();

    await invalidateTicketCache();
    
    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: result[0],
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Update ticket failed",
      "Unable to update the ticket right now. Please try again.",
    );
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const result = await db
      .delete(tickets)
      .where(eq(tickets.ticketid, Number(req.params.id)))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    await invalidateTicketCache();
    
    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Delete ticket failed",
      "Unable to delete the ticket right now. Please try again.",
    );
  }
};
