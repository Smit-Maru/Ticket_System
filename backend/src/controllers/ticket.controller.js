import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { tickets } from "../../drizzle/schema.ts";

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
    let query = db.select().from(tickets);

    if (req.user.role === "staff") {
      query = query.where(eq(tickets.assignedto, Number(req.user.userId)));
    } else if (req.user.role === "user") {
      query = query.where(eq(tickets.customerid, Number(req.user.userId)));
    }

    const result = await query.orderBy(desc(tickets.createdat));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const result = await db
      .select()
      .from(tickets)
      .where(getTicketAccessFilter(req.user, req.params.id));

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
    console.error("Get Ticket Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const isAdmin = req.user.role === "admin";
    const customerId = isAdmin
      ? Number(req.body.customerid)
      : Number(req.user.userId);
    const priority = isAdmin ? (req.body.priority || "low").toLowerCase() : "low";
    const status = isAdmin ? req.body.status || "open" : "open";
    const assignedTo = isAdmin && req.body.assignedto
      ? Number(req.body.assignedto)
      : null;

    if (!subject || !description || !Number.isInteger(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Subject, description, and customer are required",
      });
    }

    if (!ticketStatusValues.includes(status) || !ticketPriorityValues.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status or priority",
      });
    }

    const result = await db
      .insert(tickets)
      .values({
        subject,
        description,
        customerid: customerId,
        assignedto: assignedTo,
        assignedat: assignedTo ? new Date().toISOString() : null,
        status,
        priority,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Create Ticket Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const ticketFilter = getTicketAccessFilter(req.user, req.params.id);
    const existingTickets = await db
      .select()
      .from(tickets)
      .where(ticketFilter);

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
      if (req.body.description !== undefined) ticketData.description = req.body.description;
    }

    if (ticketData.status && !ticketStatusValues.includes(ticketData.status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    if (ticketData.priority && !ticketPriorityValues.includes(ticketData.priority)) {
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

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Update Ticket Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete Ticket Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

