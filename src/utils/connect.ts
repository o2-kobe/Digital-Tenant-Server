import mongoose from "mongoose";
import config from "config";
import logger from "./logger";

const dbUri = config.get<string>("dbUri");

export async function connect() {
  try {
    await mongoose.connect(dbUri);
  } catch (error) {
    logger.error("Failed to connect to db");
  }
}
