const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // Read the token from the req cookies
    const cookies = req.cookies;
    const { token } = cookies;

    if (!token) {
      return res.status(401).send("Please Login");
    }
    // Validate the token
    const decodedMessage = await jwt.verify(token, process.env.SECRET_KEY);
    const { _id } = decodedMessage;
    // console.log(decodedMessage);
    // find the user
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User Not found auth");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error" + "=>" + error);
  }
};

module.exports = userAuth;
