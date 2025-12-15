const express = require("express");
const sweetsRouter = express.Router();
const Sweet = require("../models/sweets");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

sweetsRouter.post("/sweets", auth, adminOnly, async (req, res) => {
  try {
    const { name, category, price, quantity, discription, photo } = req.body;

    if (!name || !category || price == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sweet = await Sweet.create({
      name,
      category,
      price,
      quantity,
      discription,
      photo,
    });

    await sweet.save();

    res.status(201).json({
      message: "Sweet added successfully",
      sweet,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//add all sweets data by admin only
sweetsRouter.post("/sweets/bulk", auth, adminOnly, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "Expected an array of sweets" });
    }

    const sweets = await Sweet.insertMany(req.body);

    res.status(201).json({
      message: "Sweets added successfully",
      count: sweets.length,
      sweets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all sweets
sweetsRouter.get("/view/sweets", async (req, res) => {
  try {
    const sweets = await Sweet.find();

    res.status(200).json({
      message: "Sweets fetched successfully",
      count: sweets.length,
      sweets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SEARCH sweets
sweetsRouter.get("/sweets/search", async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;

    const filter = {};

    // Search by name (partial & case-insensitive)
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sweets = await Sweet.find(filter);

    res.status(200).json({
      message: "Search results",
      count: sweets.length,
      sweets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE sweet (Admin only)
sweetsRouter.put("/update/sweets/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const updatedSweet = await Sweet.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedSweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    res.status(200).json({
      message: "Sweet updated successfully",
      sweet: updatedSweet,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE sweet (Admin only)
sweetsRouter.delete("/api/sweets/:id", auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSweet = await Sweet.findByIdAndDelete(id);

    if (!deletedSweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    res.status(200).json({
      message: "Sweet deleted successfully",
      sweet: deletedSweet,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PURCHASE sweet (User/Admin)
sweetsRouter.post("/api/sweets/:id/purchase", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const sweet = await Sweet.findById(id);

    if (!sweet) {
      return res.status(404).json({ message: "Sweet not found" });
    }

    if (sweet.quantity < quantity) {
      return res.status(400).json({
        message: "Insufficient stock",
        available: sweet.quantity,
      });
    }

    sweet.quantity -= quantity;
    await sweet.save();

    res.status(200).json({
      message: "Purchase successful",
      purchased: quantity,
      remainingStock: sweet.quantity,
      sweet,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RESTOCK sweet (Admin only)
sweetsRouter.post(
  "/api/sweets/:id/restock",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      const sweet = await Sweet.findById(id);

      if (!sweet) {
        return res.status(404).json({ message: "Sweet not found" });
      }

      sweet.quantity += quantity;
      await sweet.save();

      res.status(200).json({
        message: "Restock successful",
        added: quantity,
        totalStock: sweet.quantity,
        sweet,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);


module.exports = sweetsRouter;
