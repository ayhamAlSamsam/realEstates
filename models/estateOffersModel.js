// models/EstateModel.js
const mongoose = require("mongoose");

const estateSchema = new mongoose.Schema(
  {
    code: { type: String, uppercase: true, trim: true },
    offerNumber: { type: String, unique: true, trim: true },
    title: { type: String, trim: true },
    slug: { type: String, lowercase: true },

    processType: { type: String, default: "sale" },
    offerType: {
      type: String,
      enum: ["direct", "auction", "tender", "exchange"],
      default: "direct",
    },
    estateType: { type: String },

    city: { type: String, trim: true },
    neighborhood: { type: String, trim: true },
    address: { type: String, trim: true },
    buildingNumber: { type: String, trim: true },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    mapUrl: { type: String },

    directions: [{ type: [String], enum: ["north", "south", "east", "west"] }],
    furnishingStatus: {
      type: String,
      default: "unfurnished",
    },
    facade: {
      type: String,
      trim: true,
    },
    totalSpace: { type: Number },
    builtArea: { type: Number, default: 0 },
    landArea: { type: Number, default: 0 },
    areaUnit: { type: String, default: "sqm" },

    rooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },

    floorNumber: { type: Number, default: null },
    totalFloors: { type: Number, default: null },
    hasElevator: { type: Boolean, default: false },
    roofPriority: {
      type: String,
    },

    price: {
      minSYP: Number,
      maxSYP: Number,
      minUSD: Number,
      maxUSD: Number,
    },
    minPrice: { type: Number, default: null },
    currency: { type: String, default: "USD" },
    isNegotiable: { type: Boolean, default: false },

    paymentType: { type: String, default: "all" },
    downPayment: { type: Number, default: 0 }, // مقدم الدفع
    installmentMonths: { type: Number, default: 0 }, // عدد شهور التقسيط

    description: { type: String },
    shortDescription: { type: String },

    vacuumType: {
      type: String,
    },

    estateCondition: {
      type: String,
      enum: [
        "new",
        "excellent",
        "very_good",
        "good",
        "needs_renovation",
        "under_construction",
      ],
      default: "good",
    },
    buildingAge: { type: Number, default: null },

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

    propertyCondition: { type: String, default: "good" },
    yearBuilt: { type: Number },
    furnishingStatus: { type: String, default: "unfurnished" },

    mainImage: { type: String },
    images: [String],
    files: [String],
    videoUrl: { type: String },
    videoFiles: [String],
    virtualTourUrl: { type: String },

    agentName: { type: String, trim: true },
    agentPhone: { type: String, trim: true },
    agentEmail: { type: String, lowercase: true },
    staffParcode: { type: String, trim: true },

    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false },
    status: { type: String, default: "pending" },

    listingExpiryDate: { type: Date, default: null }, // تاريخ انتهاء العرض
    lastModifiedDate: { type: Date, default: Date.now }, // تاريخ آخر تعديل
    closedDate: { type: Date, default: null }, // تاريخ إغلاق العرض

    ownerName: { type: String },
    ownerNumber: { type: String },

    nearbyPlaces: {
      schools: { type: Number, default: 0 },
      hospitals: { type: Number, default: 0 },
      malls: { type: Number, default: 0 },
      restaurants: { type: Number, default: 0 },
      metro: { type: Number, default: 0 },
    },
    pricePerMeterFrom: {
      type: Number,
    }, // السعر بالمتر من

    pricePerMeterTo: {
      type: Number,
    }, // السعر بالمتر إلى

    recordNumber: {
      type: String,
      trim: true,
    }, // رقم المحضر

    parcelNumber: {
      type: String,
      trim: true,
    }, // رقم المقسم

    availability: {
      type: String,
      trim: true,
    }, // الفراغة

    partnership: {
      type: String,
      trim: true,
    }, // شراكة العرض
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

estateSchema.pre("save", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

estateSchema.index({ code: 1 });
estateSchema.index({ offerNumber: 1 });
estateSchema.index({ slug: 1 });
estateSchema.index({ city: 1, neighborhood: 1 });
estateSchema.index({ price: 1 });
estateSchema.index({ processType: 1, estateType: 1 });
estateSchema.index({ createdAt: -1 });
estateSchema.index({ "location.lat": 1, "location.lng": 1 });

const Estate = mongoose.model("Estate", estateSchema);

module.exports = Estate;
