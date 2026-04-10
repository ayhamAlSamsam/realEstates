const { Server } = require("socket.io");
const Estate = require("./models/estateOffersModel");

let io;

let currentState = {
  filters: {
    search: "",
    type: [], // estateType
    price: {},
    rooms: [], // bedrooms
    status: "All",
  },
  selectedOffer: null,
  offers: [],
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.emit("init", currentState);

    socket.on("update-state", async (newState) => {
      try {
        currentState.filters = newState.filters;

        const { search, type, price, rooms, status } =
          currentState.filters;

        let query = {};

        // 🔍 SEARCH
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: "i" } },
            { code: { $regex: search, $options: "i" } }, // بدل propertyCode
            { city: { $regex: search, $options: "i" } },
            { neighborhood: { $regex: search, $options: "i" } },
          ];
        }

        // 🏠 TYPE
        if (type?.length) {
          query.estateType = { $in: type };
        }

        // 💰 PRICE
        if (price?.min || price?.max) {
          query.price = {};
          if (price.min) query.price.$gte = Number(price.min);
          if (price.max) query.price.$lte = Number(price.max);
        }

        // 🛏 ROOMS
        if (rooms?.length) {
          query.bedrooms = { $in: rooms.map((r) => Number(r)) };
        }

        // 📊 STATUS
        if (status && status !== "All") {
          query.status = status;
        }

        // ⚠️ مهم: لا تجيب كل الداتا
        const estates = await Estate.find(query)
          .limit(50)
          .sort({ createdAt: -1 });

        currentState.offers = estates;

        console.log("📊 Estates:", estates);

        io.emit("state-updated", currentState);
      } catch (err) {
        console.error("Socket error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
};

module.exports = { initSocket };