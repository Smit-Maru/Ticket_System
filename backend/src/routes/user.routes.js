import express from "express";
import { addUser, getUsers, getUsersById } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUsers);

router.get("/:id", getUsersById)

router.post("/", addUser)

export default router;