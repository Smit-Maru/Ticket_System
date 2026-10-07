import express from "express";
import {
  getAdminDashboard,
  getStaffDashboard,
} from "../controllers/dashboard.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/admin", authenticate, authorize("admin"), getAdminDashboard);
router.get("/staff", authenticate, authorize("staff"), getStaffDashboard);

export default router;