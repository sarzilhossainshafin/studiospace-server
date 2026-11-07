
import express from "express";

import {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/bookingController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware);

// Get logged-in user's bookings
router.get("/", getAllBookings);

// Create a booking
router.post("/", createBooking);

// Update booking status
router.patch("/:id", updateBookingStatus);

// Cancel a pending booking
router.patch("/:id/cancel", cancelBooking);

export default router;
