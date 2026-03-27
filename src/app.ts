import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";
import cors from "cors";
import config from "config";
import logger from "./utils/logger";
import connect from "./utils/connect";

const PORT = config.get<number>("port");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// All routes mounted here
app.use("/api", routes);

app.listen(PORT, async () => {
  logger.info(`App connected successfully at ${PORT}...`);

  await connect();
});

export default app;
