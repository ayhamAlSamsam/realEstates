const { Server } = require("socket.io");
const Estate = require("./models/estateOffersModel");
const buildEstateQuery = require("./utils/buildEstateQuery");

let io;

let currentState = {
  filters: {
    search: "",
    type: [],
    price: {},
    rooms: [],
    status: "All",
  },
  selectedOffer: null,
  offers: [],
};

// ✅ نفس helper تبع الكنترولر
const buildFileUrl = (baseUrl, filename, type = "images") => {
  if (!filename) return null;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

const buildFilesUrls = (baseUrl, filenames, type = "images") => {
  if (!filenames || !Array.isArray(filenames)) return [];
  return filenames.map((f) => buildFileUrl(baseUrl, f, type));
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
        const rawFilters = newState?.filters || {};

        const filters = Object.keys(rawFilters).reduce((acc, key) => {
          const value = rawFilters[key];

          if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0)
          ) {
            acc[key] = value;
          }

          return acc;
        }, {});

        if (filters.search) {
          filters.keyword = filters.search;
          delete filters.search;
        }

        if (filters.type && !Array.isArray(filters.type)) {
          filters.type = [filters.type];
        }

        if (filters.rooms && !Array.isArray(filters.rooms)) {
          filters.rooms = [filters.rooms];
        }

        const query = buildEstateQuery(filters);

        const estates = await Estate.find(query)
          .limit(50)
          .sort({ createdAt: -1 });

        // ✅ هون الحل الحقيقي
        const baseUrl = `http://localhost:8001`;

        const estatesWithUrls = estates.map((estate) => ({
          ...estate.toObject(),

          mainImage: buildFileUrl(baseUrl, estate.mainImage, "images"),

          images: buildFilesUrls(baseUrl, estate.images, "images"),

          files: buildFilesUrls(baseUrl, estate.files, "files"),

          videoFiles: buildFilesUrls(baseUrl, estate.videoFiles, "videos"),
        }));

        currentState.offers = estatesWithUrls;

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