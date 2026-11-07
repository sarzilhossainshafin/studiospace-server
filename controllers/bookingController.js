
import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

// Create a new booking with overlap check
export const createBooking = async (req, res) => {
  try {
    const {
      studioId,
      studioTitle,
      bookingDate,
      startTime,
      endTime,
      totalHours,
      totalPrice,
    } = req.body;

    // Customer identity comes from the authenticated account
    const customerEmail = req.user.email;

    if (
      !studioId ||
      !studioTitle ||
      !bookingDate ||
      !startTime ||
      !endTime ||
      totalHours === undefined ||
      totalPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking information",
      });
    }

    const start = startTime.split(":").map(Number);
    const end = endTime.split(":").map(Number);

    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];

    if (
      start.length !== 2 ||
      end.length !== 2 ||
      start.some((n) => !Number.isInteger(n)) ||
      end.some((n) => !Number.isInteger(n)) ||
      start[0] < 0 ||
      start[0] > 23 ||
      end[0] < 0 ||
      end[0] > 23 ||
      start[1] < 0 ||
      start[1] > 59 ||
      end[1] < 0 ||
      end[1] > 59 ||
      startMinutes >= endMinutes ||
      !Number.isFinite(Number(totalHours)) ||
      Number(totalHours) <= 0 ||
      !Number.isFinite(Number(totalPrice)) ||
      Number(totalPrice) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid booking time and price",
      });
    }

    const db = getDB();

    const user = await db.collection("users").findOne({
      email: customerEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found",
      });
    }

    // Check confirmed booking time conflicts
    const existingBooking = await db.collection("bookings").findOne({
      studioId,
      bookingDate,
      status: "Confirmed",
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "This studio is already booked for the selected time",
      });
    }

    const booking = {
      studioId,
      studioTitle,
      customerName: user.name,
      customerEmail,
      bookingDate,
      startTime,
      endTime,
      totalHours: Number(totalHours),
      totalPrice: Number(totalPrice),
      status: "Pending",
      createdAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        _id: result.insertedId,
        ...booking,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

// Get bookings of the logged-in customer only
export const getAllBookings = async (req, res) => {
  try {
    const db = getDB();

    const bookings = await db
      .collection("bookings")
      .find({
        customerEmail: req.user.email,
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// Update booking status: only the studio owner can update it
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const db = getDB();

    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!ObjectId.isValid(booking.studioId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(booking.studioId),
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    if (
      studio.hostEmail?.toLowerCase() !== req.user.email.toLowerCase()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this booking",
      });
    }

    await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    console.error("Update booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

// Cancel a pending booking: only the customer who made it
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const db = getDB();

    const result = await db.collection("bookings").updateOne(
      {
        _id: new ObjectId(id),
        customerEmail: req.user.email,
        status: "Pending",
      },
      {
        $set: {
          status: "Cancelled",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Booking not found or cannot be cancelled",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};
