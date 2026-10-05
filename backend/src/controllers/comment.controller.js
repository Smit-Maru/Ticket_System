import { and, asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { comments, tickets, users } from "../../drizzle/schema.ts";

async function getAccessibleTicket(req, res) {
  const ticketId = Number(req.params.ticketId);

  if (!Number.isSafeInteger(ticketId)) {
    res.status(400).json({ success: false, message: "Invalid ticket ID." });
    return null;
  }

  const filters = [eq(tickets.ticketid, ticketId)];

  if (req.user.role === "staff") {
    filters.push(eq(tickets.assignedto, Number(req.user.userId)));
  } else if (req.user.role === "user") {
    filters.push(eq(tickets.customerid, Number(req.user.userId)));
  }

  const [ticket] = await db
    .select({ ticketid: tickets.ticketid })
    .from(tickets)
    .where(and(...filters))
    .limit(1);

  if (!ticket) {
    res.status(404).json({ success: false, message: "Ticket not found." });
    return null;
  }

  return ticketId;
}

function commentSelection() {
  return {
    commentid: comments.commentid,
    comment: comments.comment,
    commentby: comments.commentby,
    commenton: comments.commenton,
    authorName: users.name,
    authorRole: users.role,
  };
}

export const getTicketComments = async (req, res) => {
  try {
    const ticketId = await getAccessibleTicket(req, res);
    if (!ticketId) return;

    const result = await db
      .select(commentSelection())
      .from(comments)
      .innerJoin(users, eq(comments.commentby, users.userid))
      .where(eq(comments.ticketid, ticketId))
      .orderBy(asc(comments.commenton), asc(comments.commentid));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Get Ticket Comments Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTicketComment = async (req, res) => {
  try {
    const ticketId = await getAccessibleTicket(req, res);
    if (!ticketId) return;

    const comment =
      typeof req.body.comment === "string" ? req.body.comment.trim() : "";
    const userId = Number(req.user.userId);

    if (!comment) {
      return res
        .status(400)
        .json({ success: false, message: "Comment cannot be empty." });
    }

    if (comment.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Comment must be 5000 characters or fewer.",
      });
    }

    if (!Number.isSafeInteger(userId)) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid user session." });
    }

    const [insertedComment] = await db
      .insert(comments)
      .values({ comment, commentby: userId, ticketid: ticketId })
      .returning({ commentid: comments.commentid });

    const [result] = await db
      .select(commentSelection())
      .from(comments)
      .innerJoin(users, eq(comments.commentby, users.userid))
      .where(eq(comments.commentid, insertedComment.commentid));

    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Add Ticket Comment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
