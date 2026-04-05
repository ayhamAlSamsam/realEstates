// models/requestModel.js
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    // ==========  REQUEST BASIC INFORMATION ==========
    requestNumber: {
      type: String,
      unique: true,
      default: () => `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },

    // ==========  CUSTOMER INFORMATION ==========
    customer: {
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Customer email is required"],
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      },
      phone: {
        type: String,
        required: [true, "Customer phone is required"],
        trim: true,
      },
      alternativePhone: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },

    // ==========  PROPERTY REQUIREMENTS ==========
    requirements: {
      estateTypes: [
        {
          type: String,
          enum: [
            "apartment",
            "villa",
            "house",
            "townhouse",
            "duplex",
            "penthouse",
            "studio",
            "commercial",
            "land",
            "building",
            "chalet",
            "farm",
            "warehouse",
          ],
        },
      ],

      processType: {
        type: String,
        enum: ["for_sale", "for_rent", "for_lease"],
      },

      employeebarcode: {
        type: String,
      },

      city: {
        type: String,
        trim: true,
      },
      neighborhood: {
        type: String,
        trim: true,
      },

      floorNumber: {
        type: Number,
        min: 0,
      },

      minSpace: {
        type: Number,
        min: 0,
      },
      maxSpace: {
        type: Number,
        min: 0,
      },

      minRooms: {
        type: Number,
        min: 0,
      },
      maxRooms: {
        type: Number,
        min: 0,
      },

      minPrice: {
        type: Number,
        min: 0,
      },

      maxPrice: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "TRY", "AED", "SAR", "EGP", "JOD"],
        default: "USD",
      },

      requiredFeatures: {
        hasBalcony: { type: Boolean, default: false },
        hasGarden: { type: Boolean, default: false },
        hasPool: { type: Boolean, default: false },
        hasGarage: { type: Boolean, default: false },
        hasParking: { type: Boolean, default: false },
        hasFurnished: { type: Boolean, default: false },
        hasSeaView: { type: Boolean, default: false },
        hasLandmarkView: { type: Boolean, default: false },
        isPetFriendly: { type: Boolean, default: false },
      },

      propertyCondition: {
        type: String,
        enum: ["new", "excellent", "good", "needs_renovation"],
      },

      paymentType: {
        type: String,
        enum: ["cash", "installment", "mortgage", "bank_finance"],
      },
    },

    // ========== REQUEST STATUS ==========
    status: {
      type: String,
      enum: [
        "pending",
        "in_review",
        "contacted",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    requestDate: {
      type: Date,
      default: Date.now,
    },
    closedDate: Date,
    lastmodifiedDate: Date,

    // ==========  STATISTICS ==========
    stats: {
      timesContacted: { type: Number, default: 0 },
      totalFollowUps: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ========== PRE-SAVE MIDDLEWARE ==========
requestSchema.pre("save", function (next) {
  if (!this.requestNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    this.requestNumber = `REQ-${timestamp}-${random}`;
  }
  next();
});

// ========== INDEXES ==========
requestSchema.index({ requestNumber: 1 });
requestSchema.index({ "customer.email": 1 });
requestSchema.index({ status: 1, priority: 1 });
requestSchema.index({ createdAt: -1 });
requestSchema.index({ interestedEstate: 1 });
requestSchema.index({ "requirements.city": 1 });
requestSchema.index({ "requirements.estateTypes": 1 });

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
