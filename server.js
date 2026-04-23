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
const estateRequestsRoute = require("./routes/estateRequest.route");

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
app.use("/api/estate-requests", estateRequestsRoute);

const http = require("http");
const { initSocket } = require("./socket");
const server = http.createServer(app);

// تهيئة Socket
initSocket(server);

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
