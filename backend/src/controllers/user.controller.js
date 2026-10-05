import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../../drizzle/schema.ts";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const result = await db.select().from(users).where(eq(users.role, "user"));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Create User Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, email, passwordhash, role } = req.body;

    const result = await db
      .update(users)
      .set({
        name: name,
        email: email,
        passwordhash: passwordhash,
        role: role,
      })
      .where(eq(users.userid, Number(id)))
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
    console.error("Update User Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: `error : ${error.message}`,
    });
  }
};
