import express from "express";
import { getStaff } from "../controllers/staff.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getStaff);

export default router;