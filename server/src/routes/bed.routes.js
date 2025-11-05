import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { createBed, getBeds, updateBed, getBedAvailability } from "../controllers/bed.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", getBeds);
router.get("/availability", getBedAvailability);
router.post("/", authorizeRoles("Admin"), createBed);
router.put("/:id", authorizeRoles("Admin"), updateBed);

export default router;
