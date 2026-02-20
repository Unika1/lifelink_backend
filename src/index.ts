import app from "./app";
import { PORT } from "./config/index";
import { connectDatabase } from "./database/mongodb";

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
}

startServer();
