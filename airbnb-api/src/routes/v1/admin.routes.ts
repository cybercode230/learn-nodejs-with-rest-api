import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware.js";
import { approveListing, rejectListing, triggerReminders } from "../../controllers/admin.controller.js";

const router = Router();

router.put("/listings/:id/approve", authenticate, requireAdmin, approveListing);
router.put("/listings/:id/reject", authenticate, requireAdmin, rejectListing);
router.post("/trigger-reminders", authenticate, requireAdmin, triggerReminders);

export default router;
