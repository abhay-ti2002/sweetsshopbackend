const mongoose = require("mongoose");

const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    discription: {
      type: String,
      required: true,
      trim: true,
    },
    photo: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// MongoDB automatically creates _id as Primary Key
module.exports = mongoose.model("Sweet", sweetSchema);
