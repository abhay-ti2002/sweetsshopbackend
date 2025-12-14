const validator = require("validator");

const validateLoginEmail = (loginEmail) => {
  if (!validator.isEmail(loginEmail)) {
    throw new Error("Login Email is not correct");
  }
};

module.exports = { validateLoginEmail };
