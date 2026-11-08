
import express from "express";

import {
  registerUser,
  loginUser,
  googleLogin,
  logoutUser,
  getCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/logout", logoutUser);
router.get("/me", getCurrentUser);

export default router;
