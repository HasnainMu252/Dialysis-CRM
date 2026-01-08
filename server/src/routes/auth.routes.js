import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { patientLogin,patientRegister } from "../controllers/auth.controller.js";


const router = Router();

router.post("/register", register); // reserve for Admin only later if needed
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/patient-login",patientLogin)
// ✅ NEW PUBLIC PATIENT REGISTER
router.post("/patient-register", patientRegister);

export default router;
