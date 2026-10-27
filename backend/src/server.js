import "dotenv/config";
import app from "./app.js";
import { connectRedis } from "./config/redis.js";

const PORT = 5000;

async function startServer(params) {
  try{
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Fail to Start server ",error);
    process.exit(1);
  }
}

startServer();
