import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../../drizzle/schema.ts";
import bcrypt from "bcrypt";
import { sendServerError } from "../middleware/error.middleware.js";

export const getStaff = async (req, res) => {
  try {
    const result = await db.select().from(users).where(eq(users.role, "staff"));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Get staff failed",
      "Unable to load staff right now. Please try again.",
    );
  }
};

export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = Number(id);

    if (!Number.isInteger(staffId) || staffId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff ID",
      });
    }

    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.userid, staffId), eq(users.role, "staff")));

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
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
      "Get staff member failed",
      "Unable to load this staff member right now. Please try again.",
    );
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const passwordhash = await bcrypt.hash(password, 12);
    const result = await db
      .insert(users)
      .values({ name, email, passwordhash, role: "staff" })
      .returning();

    const user = result[0];

    let roleid = null;

    roleid = `STF_${user.userid}`;

    const updatedUser = await db
      .update(users)
      .set({
        roleid,
      })
      .where(eq(users.userid, user.userid))
      .returning();

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: result[0],
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Create staff failed",
      "Unable to create the staff member. Please check the details and try again.",
    );
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const userOldPassword = await db
      .select({
        passwordhash: users.passwordhash,
      })
      .from(users)
      .where(and(eq(users.userid, Number(id)), eq(users.role, "staff")));

    if (userOldPassword.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    const staffData = {
      name,
      email,
      role: "staff",
    };

    // If password is provided, hash the new password
    // Otherwise keep the old password
    if (password) {
      staffData.passwordhash = await bcrypt.hash(password, 12);
    } else {
      staffData.passwordhash = userOldPassword[0].passwordhash;
    }

    const result = await db
      .update(users)
      .set(staffData)
      .where(and(eq(users.userid, Number(id)), eq(users.role, "staff")))
      .returning();

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: result[0],
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Update staff failed",
      "Unable to update the staff member. Please check the details and try again.",
    );
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db
      .delete(users)
      .where(and(eq(users.userid, Number(id)), eq(users.role, "staff")))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Staff deleted successfully",
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Delete staff failed",
      "Unable to delete the staff member right now. Please try again.",
    );
  }
};

export const staffDropdown = async (req, res) => {
  try {
    const result = await db
      .select({ userid: users.userid, name: users.name })
      .from(users)
      .where(eq(users.role, "staff"));

    res.status(200).json({
      success: true,
      message: "Staff dropdown fetched successfully",
      data: result,
    });
  } catch (error) {
    sendServerError(
      res,
      error,
      "Load staff options failed",
      "Unable to load staff options right now. Please try again.",
    );
  }
};
