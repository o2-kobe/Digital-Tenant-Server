import express from "express";
import { generateRandomKey } from "./utils/helper";

const app = express();
app.use(express.json());

console.log(generateRandomKey(6));
app.listen(400, () => console.log("App started successfully"));
