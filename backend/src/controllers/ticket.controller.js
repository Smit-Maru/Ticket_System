import { and, desc, eq, sql, or, ilike, isNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "../db/index.js";
import { tickets, users } from "../../drizzle/schema.ts";
import { sendServerError } from "../middleware/error.middleware.js";

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
    const { search, status, priority} = req.query;

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

    // Store all conditions here
    const filters = [];

    // Staff can only see tickets assigned to themselves
    if (req.user.role === "staff") {
      filters.push(
        eq(tickets.assignedto, Number(req.user.userId))
      );
    }

    // User can only see their own tickets
    else if (req.user.role === "user") {
      filters.push(
        eq(tickets.customerid, Number(req.user.userId))
      );
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
    
      if (search.trim().toLowerCase() === "unassigned") {
        searchFilters.push(isNull(tickets.assignedto));
      }
    
      filters.push(or(...searchFilters));
    }

    //filter
    if(status && status.trim() !== ""){
      filters.push(eq(tickets.status,status))
    }

    if(priority && priority.trim() !== ""){
      filters.push(eq(tickets.priority,priority))
    }

    // if(assignedStaff && assignedStaff !== ""){
    //   filters.push(eq(tickets.assignedStaff,assignedStaff))
    // }

    // Apply all filters together
    if (filters.length > 0) {
      query = query.where(and(...filters));
    }

    const result = await query.orderBy(
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
    );

    res.status(200).json({
      success: true,
      data: result,
    });
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


    if(req.params.role === "user"){
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
