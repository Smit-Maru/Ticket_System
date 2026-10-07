import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../../drizzle/schema.ts";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendServerError } from "../middleware/error.middleware.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.select().from(users).where(eq(users.email, email));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found. Please sign up.",
      });
    }

    const user = result[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordhash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.userid,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Login failed",
      "Unable to sign you in right now. Please try again.",
    );
  }
};

export const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db
      .insert(users)
      .values({
        name: name,
        email: email,
        passwordhash: hashedPassword,
        role: "user",
      })
      .returning();

    const user = result[0];

    const token = jwt.sign(
      {
        userId: user.userid,
        user: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: false,
      path: "/",
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      console.error("Sign up failed: email already registered.");
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please use another email.",
      });
    }

    return sendServerError(
      res,
      error,
      "Sign up failed",
      "Unable to create your account right now. Please try again.",
    );
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
