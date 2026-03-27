import { Request, Response, Router } from "express";
import {
  createUserHandler,
  deleteUserHandler,
  findActiveTenantsOfLandlordHandler,
  getCurrentUserHandler,
} from "./controller/user.controller";
import {
  createSessionHandler,
  deleteSessionHandler,
  getSessionsHandler,
  refreshAccessTokenHandler,
} from "./controller/session.controller";
import { requireUser } from "./middleware/requireUser";
import { loginLimiter } from "./middleware/rateLimit";
import validateResource from "./middleware/validateResource";
import { createUserSchema } from "./schema/user.schema";
import { createSessionSchema } from "./schema/session.schema";
import {
  createTenancyHandler,
  endTenancyHandler,
  findActiveTenanciesByRoomHandler,
  findOneTenancyHandler,
} from "./controller/tenancy.controller";
import {
  createTenancySchema,
  tenancyParamsSchema,
} from "./schema/tenancy.schema";
import {
  createRoomSchema,
  roomParamsSchema,
  updateRoomSchema,
} from "./schema/room.schema";
import {
  createRoomHandler,
  deleteRoomHandler,
  findAllRoomsByPropertyHandler,
  findOneRoomHandler,
  getMonthlyRevenueHandler,
  updateRoomHandler,
} from "./controller/room.controller";
import {
  createPropertySchema,
  propertyParamsSchema,
  updatePropertySchema,
} from "./schema/property.schema";
import {
  createPropertyHandler,
  deletePropertyHandler,
  getAllPropertiesByLanlordHandler,
  getOnePropertyHandler,
  updatePropertyHandler,
} from "./controller/property.controller";
import {
  billParamsSchema,
  createBillSchema,
  updateBillSchema,
} from "./schema/bill.schema";
import {
  completeBillHandler,
  createBillForRoomsUnderPropertyHandler,
  createBillHandler,
  findBillsByTenancyHandler,
  findBillsForPropertyHandler,
  findBillsForRoomHandler,
  findPendingPaymentsHandler,
  markBillAsPaidHandler,
  updateBillHandler,
} from "./controller/bill.controller";
import {
  announcementParamsSchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
} from "./schema/announcement.schema";
import {
  broadcastAnnouncementHandler,
  createAnnouncementHandler,
  deleteAnnouncementHandler,
  findAnnouncementHandler,
  findPropertyAnnouncementsHandler,
  findRoomAnnouncementsHandler,
  updateAnnouncementHandler,
} from "./controller/announcement.controller";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  res.send("Digital Tenant System ...");
});

// *****************
// User Routes
router.post("/users", validateResource(createUserSchema), createUserHandler);
router.get("/users", requireUser, getCurrentUserHandler);
router.delete("/users", requireUser, deleteUserHandler);
router.get("/active-tenants", requireUser, findActiveTenantsOfLandlordHandler);

// *****************
// Session Routes
router.post(
  "/sessions",
  loginLimiter,
  validateResource(createSessionSchema),
  createSessionHandler,
);

router.get("/sessions", requireUser, getSessionsHandler);
router.delete("/sessions", requireUser, deleteSessionHandler);

router.post("/sessions/refresh", loginLimiter, refreshAccessTokenHandler);

router.use(requireUser);

// *****************
// Tenancy Routes
router.post(
  "/tenancies/:propertyId/:roomId",
  validateResource(createTenancySchema),
  createTenancyHandler,
);

router.get(
  "/tenancies/:id",
  validateResource(tenancyParamsSchema),
  findOneTenancyHandler,
);

router.get(
  "/tenancies/:id/rooms",
  validateResource(tenancyParamsSchema),
  findActiveTenanciesByRoomHandler,
);

router.patch(
  "/tenancies/:id/endTenancy",
  validateResource(tenancyParamsSchema),
  endTenancyHandler,
);

// *****************
// Rooms Routes
router.post(
  "/rooms/:id",
  validateResource(createRoomSchema),
  createRoomHandler,
);

router.get(
  "/rooms/:id",
  validateResource(roomParamsSchema),
  findOneRoomHandler,
);

router.get(
  "/rooms/:id/property",
  validateResource(roomParamsSchema),
  findAllRoomsByPropertyHandler,
);

router.patch(
  "/rooms/:id",
  validateResource(updateRoomSchema),
  updateRoomHandler,
);

router.delete(
  "/rooms/:id",
  validateResource(roomParamsSchema),
  deleteRoomHandler,
);

router.get("/getMonthlyRevenue", getMonthlyRevenueHandler);

// *****************
// Property Routes
router.post(
  "/properties",
  validateResource(createPropertySchema),
  createPropertyHandler,
);

router.get("/properties", getAllPropertiesByLanlordHandler);

router.get(
  "/properties/:id",
  validateResource(propertyParamsSchema),
  getOnePropertyHandler,
);

router.patch(
  "/properties/:id",
  validateResource(updatePropertySchema),
  updatePropertyHandler,
);

router.delete(
  "/properties/:id",
  validateResource(propertyParamsSchema),
  deletePropertyHandler,
);

// *****************
// Bill Routes
router.post(
  "/bills/:id",
  validateResource(createBillSchema),
  createBillHandler,
);

router.post(
  "/bills/:id/broadcast",
  validateResource(createBillSchema),
  createBillForRoomsUnderPropertyHandler,
);

// Find Bills by property
router.get(
  "/bills/:id/property",
  validateResource(billParamsSchema),
  findBillsForPropertyHandler,
);

router.get(
  "/bills/:id/room",
  validateResource(billParamsSchema),
  findBillsForRoomHandler,
);

router.get("/pendingPayments", findPendingPaymentsHandler);

router.patch(
  "/bills/:id",
  validateResource(updateBillSchema),
  updateBillHandler,
);

router.patch(
  "/bills/:id/completed",
  validateResource(billParamsSchema),
  completeBillHandler,
);

router.patch(
  "/bills/:id/paid",
  validateResource(billParamsSchema),
  markBillAsPaidHandler,
);

// *****************
// Announcement Routes

// requires tenancyId
router.post(
  "/announcements/:id",
  validateResource(createAnnouncementSchema),
  createAnnouncementHandler,
);

router.post(
  "/announcements/:id/broadcast",
  validateResource(createAnnouncementSchema),
  broadcastAnnouncementHandler,
);

router.get(
  "/announcements/:id",
  validateResource(announcementParamsSchema),
  findAnnouncementHandler,
);
router.get(
  "/announcements/:id/room",
  validateResource(announcementParamsSchema),
  findRoomAnnouncementsHandler,
);

router.get(
  "/announcements/:id/property",
  validateResource(announcementParamsSchema),
  findPropertyAnnouncementsHandler,
);

router.patch(
  "/announcements/:id",
  validateResource(updateAnnouncementSchema),
  updateAnnouncementHandler,
);

router.delete(
  "/announcements/:id",
  validateResource(announcementParamsSchema),
  deleteAnnouncementHandler,
);

export default router;
