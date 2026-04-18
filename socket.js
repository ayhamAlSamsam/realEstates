const { Server } = require("socket.io");
const Estate = require("./models/estateOffersModel");
const buildEstateQuery = require("./utils/buildEstateQuery");

let io;

// ========= normalize filters (نفس منطق السيرفس) =========
const normalizeEstateFilters = (queryParams = {}) => {
  const filters = {};

  // ========= KEYWORD =========
  if (queryParams.search || queryParams.keyword) {
    filters.keyword = queryParams.search || queryParams.keyword;
  }

  // ========= LOCATION =========
  if (queryParams.city) filters.city = queryParams.city;

  if (queryParams.neighborhood) {
    filters.neighborhood = queryParams.neighborhood;
  }

  // ========= PROCESS =========
  if (queryParams.processType) {
    filters.processType = queryParams.processType;
  }

  // ========= STATUS =========
  if (queryParams.status && queryParams.status !== "All") {
    filters.status = queryParams.status;
  }

  // ========= TYPE =========
  if (queryParams.estateType) {
    filters.type = [queryParams.estateType];
  }

  // ========= ROOMS =========
  if (queryParams.bedrooms) {
    filters.rooms = [parseInt(queryParams.bedrooms)];
  }

  // ========= BATHROOMS =========
  if (queryParams.bathrooms) {
    filters.bathrooms = parseInt(queryParams.bathrooms);
  }

  // ========= BOOLEAN =========
  if (queryParams.isFeatured !== undefined) {
    filters.isFeatured =
      queryParams.isFeatured === "true" ||
      queryParams.isFeatured === true;
  }

  if (queryParams.isUrgent !== undefined) {
    filters.isUrgent =
      queryParams.isUrgent === "true" ||
      queryParams.isUrgent === true;
  }

  // ========= PRICE =========
  if (queryParams.minPrice || queryParams.maxPrice) {
    filters.price = {};

    if (queryParams.minPrice) {
      filters.price.min = parseFloat(queryParams.minPrice);
    }

    if (queryParams.maxPrice) {
      filters.price.max = parseFloat(queryParams.maxPrice);
    }
  }

  // ========= SPACE =========
  if (queryParams.minSpace) {
    filters.minSpace = parseFloat(queryParams.minSpace);
  }

  if (queryParams.maxSpace) {
    filters.maxSpace = parseFloat(queryParams.maxSpace);
  }

  // ========= CLEAN EMPTY =========
  Object.keys(filters).forEach((key) => {
    if (
      filters[key] === undefined ||
      filters[key] === null ||
      filters[key] === ""
    ) {
      delete filters[key];
    }

    if (Array.isArray(filters[key]) && filters[key].length === 0) {
      delete filters[key];
    }

    if (key === "price" && !filters.price?.min && !filters.price?.max) {
      delete filters.price;
    }

    if ((key === "minSpace" || key === "maxSpace") && !filters[key]) {
      delete filters[key];
    }
  });

  return filters;
};

// ========= state =========
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

// ========= helpers =========
const buildFileUrl = (baseUrl, filename, type = "images") => {
  if (!filename) return null;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

const buildFilesUrls = (baseUrl, filenames, type = "images") => {
  if (!filenames || !Array.isArray(filenames)) return [];
  return filenames.map((f) => buildFileUrl(baseUrl, f, type));
};

// ========= socket =========
const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.emit("init", currentState);

    socket.on("update-state", async (newState) => {
      try {
        // ✅ نفس الفلترة تماماً
        const filters = normalizeEstateFilters(
          newState?.filters || {}
        );

        const query = buildEstateQuery(filters);


        const estates = await Estate.find(query)
          .limit(50)
          .sort({ createdAt: -1 })
          .lean();

        const baseUrl = process.env.BASE_URL;

        const estatesWithUrls = estates.map((estate) => ({
          ...estate,
          mainImage: buildFileUrl(baseUrl, estate.mainImage, "images"),
          images: buildFilesUrls(baseUrl, estate.images, "images"),
          files: buildFilesUrls(baseUrl, estate.files, "files"),
          videoFiles: buildFilesUrls(baseUrl, estate.videoFiles, "videos"),
        }));

        currentState = {
          ...currentState,
          filters: newState?.filters || {},
          offers: estatesWithUrls,
        };

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