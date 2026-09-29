import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";

export const getUsers = async (req, res) => {
  try {
    const result = await db.select().from(users);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUsersById = async (req, res) => {
  try{
    const { id } = req.params;

    const result = await db.select().from(users).where(eq(users.userid, Number(id)))
    
    if (result.length === 0) {
      return res.status(404).json({
          success: false,
          message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: result[0]
    });
  } catch (error){
    res.status(200).json({
      success: true,
      data: result[0]
    });
  }
}

export const addUser = async (req, res) => {
  try{
    const {name, email, passwordhash, role} = req.body;
    
    const result = await db
      .insert(users)
      .values({
        name: name,
        email: email,
        passwordhash: passwordhash,
        role: role
      })
      .returning();

    res.status(201).json({
      success:true,
      message:"User created successfully",
      data:result[0]
    });
  } catch (error){
    console.error("Create User Error:", error);

    res.status(500).json({
      success : false,
      message: error.message
    })
  }
}