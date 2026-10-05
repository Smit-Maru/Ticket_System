import express from "express";
import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  updateTicket,
} from "../controllers/ticket.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin", "staff", "user"));

router.get("/", getTickets);
router.get("/:id", getTicketById);
router.post("/", authorize("admin", "user"), createTicket);
router.put("/:id", updateTicket);
router.delete("/:id", authorize("admin", "user"), deleteTicket);

export default router;
