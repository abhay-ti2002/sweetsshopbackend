const express = require("express");
const { connectDB } = require("./config/database");
const app = express();
const cookiesParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookiesParser());

const authRouter = require("./router/authrouter");
const sweetRoutes = require("./router/sweetsrouter");

app.use("/", authRouter);
app.use("/", sweetRoutes);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    console.log("Connected to database");
    app.listen(PORT, () => {
      console.log("Serevr start sucessfully in port 4000...");
    });
  })
  .catch((error) => {
    console.log("Not connect to database");
  });
module.exports = app;