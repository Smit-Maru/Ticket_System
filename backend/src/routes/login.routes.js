import express from "express"
import { login, logout, signUp } from "../controllers/login.controller.js";

const router = express.Router();

router.post("/", login);

router.post("/signUp", signUp)

router.post("/logout", logout)

export default router;