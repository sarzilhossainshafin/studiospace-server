
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";

// Get all studios
export const getAllStudios = async (req, res) => {
  try {
    const db = getDB();

    const studios = await db.collection("studios").find({}).toArray();

    res.status(200).json({
      success: true,
      count: studios.length,
      data: studios,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch studios",
      error: error.message,
    });
  }
};

// Get single studio by ID
export const getStudioById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const db = getDB();

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(id),
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    res.status(200).json({
      success: true,
      data: studio,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch studio",
      error: error.message,
    });
  }
};

// Create a new studio
export const createStudio = async (req, res) => {
  try {
    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      address,
      image,
      amenities,
      overview,
    } = req.body;

    if (
      !title ||
      !category ||
      hourlyRate === undefined ||
      securityDeposit === undefined ||
      maxCapacity === undefined ||
      !location ||
      !address ||
      !image ||
      !overview
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required studio information",
      });
    }

    const db = getDB();

    // Get host information from the authenticated account
    if (!req.user?.userId || !ObjectId.isValid(req.user.userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user authentication",
      });
    }

    const user = await db.collection("users").findOne({
      _id: new ObjectId(req.user.userId),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found",
      });
    }

    const newStudio = {
      title,
      category,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(securityDeposit),
      maxCapacity: Number(maxCapacity),
      location,
      address,
      image,
      amenities: Array.isArray(amenities) ? amenities : [],
      overview,
      hostName: user.name,
      hostEmail: user.email,
      createdAt: new Date(),
    };

    if (
      !Number.isFinite(newStudio.hourlyRate) ||
      !Number.isFinite(newStudio.securityDeposit) ||
      !Number.isFinite(newStudio.maxCapacity)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid studio numbers",
      });
    }

    const result = await db.collection("studios").insertOne(newStudio);

    res.status(201).json({
      success: true,
      message: "Studio created successfully",
      data: {
        _id: result.insertedId,
        ...newStudio,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create studio",
      error: error.message,
    });
  }
};

// Update an existing studio
export const updateStudio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const db = getDB();

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(id),
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    if (studio.hostEmail !== req.user?.email) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own studios",
      });
    }

    const {
      title,
      category,
      hourlyRate,
      securityDeposit,
      maxCapacity,
      location,
      address,
      image,
      amenities,
      overview,
    } = req.body;

    const updatedData = {
      title,
      category,
      hourlyRate:
        hourlyRate !== undefined ? Number(hourlyRate) : undefined,
      securityDeposit:
        securityDeposit !== undefined ? Number(securityDeposit) : undefined,
      maxCapacity:
        maxCapacity !== undefined ? Number(maxCapacity) : undefined,
      location,
      address,
      image,
      amenities:
        amenities !== undefined
          ? Array.isArray(amenities)
            ? amenities
            : []
          : undefined,
      overview,
      updatedAt: new Date(),
    };

    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    const result = await db.collection("studios").updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    res.status(200).json({
      success: true,
      message: "Studio updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update studio",
      error: error.message,
    });
  }
};

// Delete a studio
export const deleteStudio = async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
    }

    const db = getDB();

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(id),
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        message: "Studio not found",
      });
    }

    if (studio.hostEmail !== req.user?.email) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own studios",
      });
    }

    await db.collection("studios").deleteOne({
      _id: new ObjectId(id),
    });

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete studio",
      error: error.message,
    });
  }
};
