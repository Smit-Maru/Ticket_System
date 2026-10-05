import express from "express";
import {
  addUser,
  deleteUser,
  getUsers,
  getUsersById,
  updateUser,
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", getUsers);

router.get("/:id", getUsersById);

router.post("/", addUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;
