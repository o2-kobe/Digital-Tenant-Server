/* 
import express from "express";
import {
  createProperty,
  updateProperty,
  getProperty,
  deleteProperty,
} from "../controllers/property.controller";
import validateResource from "../middleware/validateResource";
import {
  createPropertySchema,
  updatePropertySchema,
  propertyParamsSchema,
} from "../schemas/property.schema";

const router = express.Router();

router.post(
  "/",
  validateResource(createPropertySchema),
  createProperty
);

router.patch(
  "/:id",
  validateResource(updatePropertySchema),
  updateProperty
);

router.get(
  "/:id",
  validateResource(propertyParamsSchema),
  getProperty
);

router.delete(
  "/:id",
  validateResource(propertyParamsSchema),
  deleteProperty
);

export default router;

import express from "express";
import { createTenancyHandler } from "../controllers/tenancy.controller";
import validateResource from "../middleware/validateResource";
import { createTenancyParamsSchema } from "../schemas/tenancy.schema";

const router = express.Router();

router.post(
  "/properties/:propertyId/rooms/:roomId/tenancies",
  validateResource(createTenancyParamsSchema),
  createTenancyHandler
);

export default router;


*/
