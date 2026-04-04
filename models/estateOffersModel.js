// models/EstateModel.js
const mongoose = require("mongoose");

const estateSchema = new mongoose.Schema(
  {
    // ========== 1. BASIC INFORMATION ==========
    code: {
      type: String,
      required: [true, "Property code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      default: () => `PRP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // ========== 2. PROCESS TYPE (Sale/Rent) ==========
    processType: {
      type: String,
      required: [true, "Process type is required"],
      enum: ["for_sale", "for_rent", "for_lease", "sold", "rented"], //for_lease is for long-term rentals (e.g., 1 year or more)
      default: "for_sale",
    },

    // ========== 3. PROPERTY TYPE ==========
    estateType: {
      type: String,
      required: [true, "Estate type is required"],
      enum: [
        "apartment",
        "villa",
        "house",
        "townhouse", // townhouse is a type of house that shares walls with neighboring houses
        "duplex",
        "penthouse", // penthouse is a luxurious apartment on the top floor of a building
        "studio",
        "commercial",
        "land",
        "building",
        "chalet", // chalet is a type of house that is typically found in mountainous areas and has a sloping roof and wide eaves
        "farm",
        "warehouse", // warehouse is a commercial property that is used for storage and distribution of goods
      ],
    },

    // ========== 4. LOCATION ==========
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    neighborhood: {
      type: String,
      required: [true, "Neighborhood is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    // ========== 5. MAP COORDINATES ==========
    location: {
      lat: {
        type: Number, // Latitude
        min: -90,
        max: 90,
      },
      lng: {
        type: Number, // Longitude
        min: -180,
        max: 180,
      },
    },
    mapUrl: {
      type: String,
    }, // mapUrl is a string that contains the URL to the location on a map service (e.g., Google Maps)

    // ========== 6. SPACE & AREA ==========
    totalSpace: {
      type: Number,
      required: [true, "Total space is required"],
      min: [1, "Space must be greater than 0"],
    },
    builtArea: {
      type: Number,
      default: 0,
    }, // builtArea Number that represents the built area of the property (e.g., the area of the building or structure on the land)
    landArea: {
      type: Number,
      default: 0,
    },
    areaUnit: {
      type: String,
      enum: ["sqm", "sqft"], // square meters or square feet
      default: "sqm",
    }, // areaUnit is a string that indicates the unit of measurement for the space (e.g., square meters or square feet)

    // ========== 7. ROOMS ==========
    bedrooms: {
      type: Number,
      required: [true, "Number of bedrooms is required"],
      min: 0,
      max: 20,
      default: 0,
    },
    bathrooms: {
      type: Number,
      required: [true, "Number of bathrooms is required"],
      min: 0,
      max: 15,
      default: 0,
    },
    livingRooms: {
      type: Number,
      default: 1,
      min: 0,
    },
    totalRooms: {
      type: Number,
      default: 0,
    },

    // ========== 8. FLOOR INFORMATION ==========
    floorNumber: {
      type: Number,
      default: null,
    }, // floorNumber is a number that represents the floor on which the property is located (e.g., 1 for first floor, 2 for second floor, etc.)
    totalFloors: {
      type: Number,
      default: null,
    }, // totalFloors is a number that represents the total number of floors in the building
    hasElevator: {
      type: Boolean,
      default: false,
    },

    // ========== 9. PRICE ==========
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be greater than 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "TRY", "AED", "SAR", "EGP", "JOD"],
      default: "USD",
    },
    pricePerMeter: {
      type: Number,
      default: null,
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    }, // isNegotiable is a boolean that indicates whether the price of the property is negotiable or not

    // ========== 10. PAYMENT TYPE ==========
    paymentType: {
      type: String,
      enum: ["cash", "installment", "mortgage", "bank_finance", "all"],
      default: "all",
    },
    downPayment: {
      type: Number, // percentage (e.g., 20%)
      min: 0,
      max: 100,
      default: 0,
    }, // downPayment is a number that represents the percentage of the total price that must be paid upfront when purchasing the property

    installmentMonths: {
      type: Number,
      min: 0,
      default: 0,
    }, // installmentMonths is a number that represents the number of months over which the remaining balance can be paid in installments

    // ========== 11. DESCRIPTION ==========
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [300, "Short description cannot exceed 300 characters"],
    },

    // ========== 12. FEATURES (Amenities) ==========
    features: {
      hasBalcony: { type: Boolean, default: false },
      hasGarden: { type: Boolean, default: false },
      hasPool: { type: Boolean, default: false },
      hasGarage: { type: Boolean, default: false },
      hasParking: { type: Boolean, default: false },
      hasStorage: { type: Boolean, default: false },
      hasAC: { type: Boolean, default: false },
      hasHeating: { type: Boolean, default: false },
      hasFurnished: { type: Boolean, default: false },
      hasSecurity: { type: Boolean, default: false },
      hasJacuzzi: { type: Boolean, default: false },
      hasSauna: { type: Boolean, default: false },
      hasGym: { type: Boolean, default: false },
      hasSeaView: { type: Boolean, default: false },
      hasLandmarkView: { type: Boolean, default: false },
      isPetFriendly: { type: Boolean, default: false },
    },

    // ========== 13. CONDITION & AGE ==========
    propertyCondition: {
      type: String,
      enum: [
        "new",
        "excellent",
        "good",
        "needs_renovation",
        "under_construction",
      ],
      default: "good",
    },
    yearBuilt: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear(),
    },
    furnishingStatus: {
      type: String,
      enum: ["unfurnished", "semi_furnished", "fully_furnished"],
      default: "unfurnished",
    }, // furnishingStatus is a string that indicates the level of furnishing of the property

    // ========== 14. MEDIA ==========
    mainImage: {
      type: String,
      required: [true, "Main image is required"],
    },
    images: [
      {
        url: { type: String, required: true },
        caption: { type: String },
        isMain: { type: Boolean, default: false },
      },
    ],
    videoUrl: {
      type: String,
    },
    virtualTourUrl: {
      type: String,
    }, // virtualTourUrl is a string that contains the URL to a virtual tour of the property (e.g., a 360-degree video or interactive walkthrough)

    // ========== 15. CONTACT INFO ==========
    agentName: {
      type: String,
      trim: true,
    },
    agentPhone: {
      type: String,
      trim: true,
    },
    agentEmail: {
      type: String,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    // ========== 16. STATISTICS ==========
    views: {
      type: Number,
      default: 0,
    },
    inquiries: {
      type: Number,
      default: 0,
    }, // inquiries is a number that represents the total number of inquiries or contacts made by potential buyers or renters regarding the property
    favorites: {
      type: Number,
      default: 0,
    },

    // ========== 17. STATUS & VERIFICATION ==========
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    }, // isFeatured is a boolean that indicates whether the property is featured or highlighted in listings or promotions
    isUrgent: {
      type: Boolean,
      default: false,
    }, // isUrgent is a boolean that indicates whether the property is marked as urgent or high-priority for sale or rent
    status: {
      type: String,
      enum: ["active", "inactive", "pending", "sold", "rented"],
      default: "pending",
    },
    // ========== 18. Dates  ==========
    listingExpiryDate: {
      type: Date,
      default: null,
    }, // listingExpiryDate is a date that represents the expiration date of the property listing

    lastModifiedDate: {
      type: Date,
      default: Date.now,
    }, // lastModifiedDate is a date that represents the last time the property information was updated or modified

    closedDate: {
      type: Date,
      default: null,
    }, // closedDate is a date that represents the date when the property was sold or rented and the transaction was completed

    // ========== 18. OWNER  ==========
    ownerName: {
      type: String,
    },
    ownerNumber: {
      type: String,
    },

    // ========== 19. NEARBY PLACES (Optional) ==========
    nearbyPlaces: {
      schools: { type: Number, default: 0 },
      hospitals: { type: Number, default: 0 },
      malls: { type: Number, default: 0 },
      restaurants: { type: Number, default: 0 },
      metro: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ========== PRE-SAVE MIDDLEWARE ==========
estateSchema.pre("save", function (next) {
  // Auto-generate slug from title
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-");
  }
});

// ========== INDEXES for better performance ==========
estateSchema.index({ code: 1 });
estateSchema.index({ slug: 1 });
estateSchema.index({ city: 1, neighborhood: 1 });
estateSchema.index({ price: 1 });
estateSchema.index({ processType: 1, estateType: 1 });
estateSchema.index({ createdAt: -1 });
estateSchema.index({ "location.lat": 1, "location.lng": 1 });

const Estate = mongoose.model("Estate", estateSchema);

module.exports = Estate;
