import { Router } from "express";
import { requireAuth, authorizeRoles } from "../middleware/auth.js";
import { listUsers, getUser, updateUser, toggleUserActive, deleteUser } from "../controllers/user.controller.js";

const router = Router();
router.use(requireAuth);
router.use(authorizeRoles("Admin"));

// Use userId as the parameter in the routes
router.get("/", listUsers);
router.get("/:id", getUser); // :id is userId
router.patch("/:id", updateUser); // :id is userId
router.patch("/:id/toggle-active", toggleUserActive); // :id is userId
router.delete("/:id", deleteUser); // :id is userId


export default router;
