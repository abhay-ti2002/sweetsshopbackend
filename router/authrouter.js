const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
// const { validationSignUpData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const { validateLoginEmail } = require("../utils/loginValidate");

authRouter.post("/singup", async (req, res) => {
  try {
    const { userName, email, password, role } = req.body;

    const saltRound = 10;
    const passwordHash = await bcrypt.hash(password, saltRound);

    const userRole = role === "admin" ? "admin" : "user";

    const user = new User({
      userName,
      email,
      password: passwordHash,
      role: userRole,
    });

    const saveUser = await user.save();
    const token = await saveUser.getJWT();

   
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false on localhost
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Signup successful",
      data: saveUser,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    validateLoginEmail(email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not a ${role}` });
    }

    const isValidatePassword = await user.validatePassword(password);
    if (!isValidatePassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = await user.getJWT();

 
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false on localhost
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});


authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successfuly");
});

module.exports = authRouter;
