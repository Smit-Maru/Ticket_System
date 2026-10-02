import express from "express";
import { addTicketComment, getTicketComments } from "../controllers/comment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin", "staff", "user"));

router.get("/ticket/:ticketId", getTicketComments);
router.post("/ticket/:ticketId", addTicketComment);

export default router;
