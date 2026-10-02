import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../../drizzle/schema.ts";
import bcrypt from "bcrypt";

export const getStaff = async (req, res) => {
  try {
    const result = await db.select().from(users).where(eq(users.role, "staff"));

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
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Create Staff Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
      .where(
        and(
          eq(users.userid, Number(id)),
          eq(users.role, "staff")
        )
      );

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
      .where(
        and(
          eq(users.userid, Number(id)),
          eq(users.role, "staff")
        )
      )
      .returning();

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: result[0],
    });

  } catch (error) {
    console.error("Update Staff Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    console.error("Delete Staff Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const staffDropdown = async (req, res) => {
  try{
    const result = await db
      .select({ userid: users.userid, name: users.name })
      .from(users)
      .where(eq(users.role, "staff"));

      res.status(200).json({
        success:true,
        message: "Staff dropdown fetched successfully",
        data:result
      })
  } catch (error) {
    console.error("Staff Dropdown Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}