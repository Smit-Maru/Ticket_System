import { eq } from "drizzle-orm"
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";

export const getStaff = async (req, res) => {
  try {
    const result = await db.select().from(users).where(eq(users.role, "staff"))

    res.status(200).json({
      success : true,
      data : result
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message:error.message
    })    
  }
}