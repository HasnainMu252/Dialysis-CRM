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

// list
router.get("/", listBilling);

// ✅ use billing CODE everywhere
router.get("/:code", getBilling);

// create/update/delete
router.post("/", authorizeRoles("Biller", "Admin"), createBilling);
router.put("/:code", authorizeRoles("Biller", "Admin"), updateBilling);
router.delete("/:code", authorizeRoles("Admin"), deleteBilling);

export default router;
