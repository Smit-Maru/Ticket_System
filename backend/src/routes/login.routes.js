import express from "express"
import { login, signUp } from "../controllers/login.controller.js";

const router = express.Router();

router.post("/", login);

router.post("/signUp", signUp)

export default router;