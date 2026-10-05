import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes.js";
import loginRoutes from "./routes/login.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import commentRoutes from "./routes/comment.routes.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ticket System API is running",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/comment", commentRoutes);

app.use("/api", loginRoutes);

export default app;
