const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//schema
const userSchema = new mongoose.Schema(
  {
    phoneNo: { type: Number },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("EMAIL IS NOT VALID");
        }
      },
    },
    password: { type: String, required: true },
    userName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user", // default role is normal user
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  // console.log(this);
  const user = this;
  const token = await jwt.sign(
    { _id: user._id, role: user.role },
    process.env.SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  console.log(typeof passwordInputByUser);
  const user = this;
  const passwordHash = user.password;

  const isValidatePassword = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );
  return isValidatePassword;
};
//model
module.exports = mongoose.model("User", userSchema);
