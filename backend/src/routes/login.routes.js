import express from "express";
import {
  login,
  logout,
  refreshAccessToken,
  signUp,
} from "../controllers/login.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", login);

router.post("/signUp", signUp);

router.post("/logout", logout);

router.post("/refresh", refreshAccessToken);

router.get("/session", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
