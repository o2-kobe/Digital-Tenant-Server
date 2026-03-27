import mongoose from "mongoose";
import logger from "./logger";

const connectDB = async () => {
  try {
    const uri = "mongodb://127.0.0.1:27017/Digital-Tenant-Landlord";

    await mongoose.connect(uri);
    console.log("✅ MongoDB Local Connected");
  } catch (error: any) {
    logger.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
