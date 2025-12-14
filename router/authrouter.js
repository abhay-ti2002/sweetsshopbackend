const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
// const { validationSignUpData } = require("../utils/validate");
const bcrypt = require("bcrypt");
const { validateLoginEmail } = require("../utils/loginValidate");

authRouter.post("/singup", async (req, res) => {
  try {
    // validationSignUpData(req);
    const { userName, email, password, role } = req.body;
    const saltRound = 10;
    const passwordHash = await bcrypt.hash(password, saltRound);

    const userRole = role === "admin" ? "admin" : "user";

    const user = await new User({
      userName,
      email,
      password: passwordHash,
      role: userRole,
    });
    const saveUser = await user.save();
    const token = await saveUser.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // ✅ REQUIRED on Vercel
      sameSite: "none", // ✅ REQUIRED for cross-origin
    });

    res.send({ message: "chlo bhai aaj ka task complete hua", data: saveUser });
  } catch (error) {
    res.status(400).json({
      error: error.message, // ✅ FIXED
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    validateLoginEmail(email);
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid credential");
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `This account is not a ${role}` });
    }

    const isValidatePassword = await user.validatePassword(password);
    // console.log("ghhg", isValidatePassword);
    if (isValidatePassword) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.send(user);
    } else {
      throw new Error("password is not correct and account is not exists");
    }
  } catch (error) {
    res.status(400).json({
      error: error.message, // ✅ FIXED
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
