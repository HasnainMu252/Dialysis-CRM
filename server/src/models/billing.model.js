import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import {
  createBilling,
  listBilling,
  getBilling,
  updateBilling,
  deleteBilling,
} from "../controllers/billing.controller.js";

const router = Router();
router.use(requireAuth);

// Admin & Biller
router.get("/", authorizeRoles("Admin", "Biller"), listBilling);
router.post("/", authorizeRoles("Admin", "Biller"), createBilling);
router.get("/:code", authorizeRoles("Admin", "Biller"), getBilling);
router.patch("/:code", authorizeRoles("Admin", "Biller"), updateBilling);

// Admin only
router.delete("/:code", authorizeRoles("Admin"), deleteBilling);

export default router;
