import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { 
  createBed,
  getBeds,
  getBedByCode,
  updateBedByCode,
  deleteBedByCode,
  updateBedStatus,
  deleteAllBeds
} from "../controllers/bed.controller.js";

const router = Router();

// All bed routes require authentication
router.use(requireAuth);

//
// ─────────────── GET ───────────────
//

// List all beds
router.get("/", getBeds);

// Get single bed by code
router.get("/:code", getBedByCode);

//
// ─────────────── POST (ADMIN) ───────────────
//

router.post("/", authorizeRoles("Admin"), createBed);

//
// ─────────────── PUT / PATCH (ADMIN or SPECIAL) ───────────────
//

// Update entire bed (admin only)
router.put("/:code", authorizeRoles("Admin"), updateBedByCode);

// Update bed status (example: admin OR nurse)
router.patch("/:code/status", updateBedStatus);

//
// ─────────────── DELETE ───────────────
//

// DELETE ALL beds (Admin only, requires ?confirm=true)
router.delete("/", authorizeRoles("Admin"), deleteAllBeds);

// DELETE single bed
router.delete("/:code", authorizeRoles("Admin"), deleteBedByCode);

export default router;
