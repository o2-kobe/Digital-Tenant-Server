import dotenv from "dotenv";

dotenv.config();

export default {
  port: 6000,
  accessTokenTtl: "15m",
  JWT_SECRET: process.env.privateKey,
  issuer: "digital-server",
  audience: "landlord-tenants",
};
