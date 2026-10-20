import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../../drizzle/schema.ts";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendServerError } from "../middleware/error.middleware.js";

const ACCESS_TOKEN_EXPIRY = "1m";
const ACCESS_TOKEN_MAX_AGE = 1 * 60 * 1000;
const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user.userid,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    { userId: user.userid },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY },
  );
}

function setAuthCookies(res, user) {
  const secure = process.env.NODE_ENV === "production";

  res.cookie("accessToken", createAccessToken(user), {
    httpOnly: true,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    sameSite: "lax",
    secure,
    path: "/",
  });

  res.cookie("refreshToken", createRefreshToken(user), {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE,
    sameSite: "lax",
    secure,
    path: "/",
  });
}

function clearAuthCookies(res) {
  const secure = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
}

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

    setAuthCookies(res, user);

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

    setAuthCookies(res, user);

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

export const refreshAccessToken = async (req, res) => {
  console.log("-----------start----------call");
  
  const refreshToken = req.cookies?.refreshToken;
  
  if (!refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: "Refresh token missing. Please login again.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: "Refresh token is invalid or expired. Please login again.",
    });
  }
  
  const userId = Number(decoded.userId);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: "Refresh token is invalid. Please login again.",
    });
  }
  
  try {
    const result = await db
    .select({
      userid: users.userid,
      email: users.email,
      role: users.role,
      isactive: users.isactive,
    })
    .from(users)
      .where(eq(users.userid, userId))
      .limit(1);

      const user = result[0];
    if (!user || !user.isactive) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Account is unavailable. Please login again.",
      });
    }

    res.cookie("accessToken", createAccessToken(user), {
      httpOnly: true,
      maxAge: ACCESS_TOKEN_MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    
    console.log("-----------end----------call");
    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Refresh access token failed",
      "Unable to refresh your session right now. Please try again.",
    );
  }
};

export const logout = (req, res) => {
  clearAuthCookies(res);

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
