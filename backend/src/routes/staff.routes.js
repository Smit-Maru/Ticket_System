import express from "express";
import {
  createStaff,
  deleteStaff,
  getStaff,
  getStaffById,
  staffDropdown,
  updateStaff,
} from "../controllers/staff.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getStaff);
router.get("/dropdown", staffDropdown);
router.get("/:id", getStaffById);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;
