const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const dbConnection = require("./config/database");

dotenv.config({ path: "config.env" });

dbConnection();

const authRoutes = require("./routes/auth.route");
const estateOffersRoutes = require("./routes/estateOffers.route");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use("/api/auth", authRoutes);
app.use("/api/estate-offers", estateOffersRoutes);

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
