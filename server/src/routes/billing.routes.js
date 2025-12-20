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
router.get("/", listBilling);
router.get("/:id", getBilling);
router.post("/", authorizeRoles("Biller", "Admin"), createBilling);
router.put("/:id", authorizeRoles("Biller", "Admin"), updateBilling);
router.delete("/:id", authorizeRoles("Admin"), deleteBilling);

export default router;
    