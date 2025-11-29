import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { 
  createBed,
  getBeds,
  getBedByCode,
  updateBedByCode,
  deleteBedByCode,
  updateBedStatus,
} from "../controllers/bed.controller.js";

const router = Router();

router.use(requireAuth);

// GET routes
router.get("/", getBeds); // Can use ?status=Available&type=ICU
router.get("/:code", getBedByCode); // Get specific bed by ID (bed-001)

// POST routes (Admin only)
router.post("/", authorizeRoles("Admin"), createBed);

// PUT routes (Admin only)
router.put("/:code", authorizeRoles("Admin"), updateBedByCode);

// DELETE routes (Admin only)
router.delete("/:code", authorizeRoles("Admin"), deleteBedByCode);
router.patch("/:code/status", updateBedStatus);

export default router;