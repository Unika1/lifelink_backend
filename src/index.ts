import app from "./app.js";
import { PORT } from "./config/index.js";
import { connectDatabase } from "./database/mongodb.js";

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
}

startServer();
