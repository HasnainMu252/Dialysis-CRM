import { Router } from "express";
import { login, register, me } from "../controllers/auth.controller.js";
import { requireAuth, patientLogin } from "../middleware/auth.js";


const router = Router();

router.post("/register", register); // reserve for Admin only later if needed
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/patient-login",patientLogin)


export default router;
