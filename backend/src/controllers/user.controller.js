import { and ,eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../../drizzle/schema.ts";
import bcrypt from "bcrypt";
import { sendServerError } from "../middleware/error.middleware.js";

export const getUsers = async (req, res) => {
  try {
    const result = await db.select().from(users).where(eq(users.role, "user"));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Get users failed",
      "Unable to load users right now. Please try again.",
    );
  }
};

export const getUsersById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .select()
      .from(users)
      .where(eq(users.userid, Number(id)));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Get user failed",
      "Unable to load this user right now. Please try again.",
    );
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const passwordhash = await bcrypt.hash(password, 12);

    const result = await db
      .insert(users)
      .values({
        name: name,
        email: email,
        passwordhash: passwordhash,
        role: role,
      })
      .returning();

    const user = result[0];

    let roleid = null;

    roleid = `CUST_${user.userid}`;

    const updatedUser = await db
      .update(users)
      .set({
        roleid,
      })
      .where(eq(users.userid, user.userid))
      .returning();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result[0],
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Create user failed",
      "Unable to create the user. Please check the details and try again.",
    );
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const userOldPassword = await db
      .select({
        passwordhash: users.passwordhash,
      })
      .from(users)
      .where(and(eq(users.userid, Number(id)), eq(users.role, "user")));

    if (userOldPassword.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const UserData = {
      name,
      email,
      role: "user",
    };

    // If password is provided, hash the new password
    // Otherwise keep the old password
    if (password) {
      UserData.passwordhash = await bcrypt.hash(password, 12);
    } else {
      UserData.passwordhash = userOldPassword[0].passwordhash;
    }

    const result = await db
      .update(users)
      .set(UserData)
      .where(and(eq(users.userid, Number(id)), eq(users.role,"user")))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User Updated successfully.",
      data: result[0],
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Update user failed",
      "Unable to update the user. Please check the details and try again.",
    );
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db
      .delete(users)
      .where(eq(users.userid, Number(id)))
      .returning();

    res.status(200).json({
      success: true,
      message: "Data is deleted successfully",
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Delete user failed",
      "Unable to delete the user right now. Please try again.",
    );
  }
};
