import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { requireAuth,authorizeRoles } from "../middleware/auth.js";
import { patientLogin,patientRegister } from "../controllers/auth.controller.js";


const router = Router();

// router.post("/register", register); // reserve for Admin only later if needed
// ✅ ADMIN creates staff users
router.post("/register", requireAuth, authorizeRoles("Admin"), register);

// admin login
router.post("/login", login);
router.get("/me", requireAuth, me);

// ✅ NEW PUBLIC PATIENT REGISTER
router.post("/patient-register", patientRegister);
router.post("/patient-login",patientLogin)

export default router;
