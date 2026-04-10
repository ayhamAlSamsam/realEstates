// models/EstateModel.js
const mongoose = require("mongoose");

const estateSchema = new mongoose.Schema(
  {
    code: { type: String, uppercase: true, trim: true },
    title: { type: String, trim: true },
    slug: { type: String, lowercase: true },

    processType: { type: String, default: "for_sale" },
    estateType: { type: String },

    city: { type: String, trim: true },
    neighborhood: { type: String, trim: true },
    address: { type: String, trim: true },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    mapUrl: { type: String },

    totalSpace: { type: Number },
    builtArea: { type: Number, default: 0 },
    landArea: { type: Number, default: 0 },
    areaUnit: { type: String, default: "sqm" },

    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    livingRooms: { type: Number, default: 1 },
    totalRooms: { type: Number, default: 0 },

    floorNumber: { type: Number, default: null },
    totalFloors: { type: Number, default: null },
    hasElevator: { type: Boolean, default: false },

    price: { type: Number },
    currency: { type: String, default: "USD" },
    pricePerMeter: { type: Number, default: null },
    isNegotiable: { type: Boolean, default: false },

    paymentType: { type: String, default: "all" },
    downPayment: { type: Number, default: 0 },
    installmentMonths: { type: Number, default: 0 },

    description: { type: String },
    shortDescription: { type: String },

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

    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false },
    status: { type: String, default: "pending" },

    listingExpiryDate: { type: Date, default: null },
    lastModifiedDate: { type: Date, default: Date.now },
    closedDate: { type: Date, default: null },

    ownerName: { type: String },
    ownerNumber: { type: String },

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
  }
);

// Pre-save middleware
estateSchema.pre("save", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-");
  }
  next();
});

// Indexes
estateSchema.index({ code: 1 });
estateSchema.index({ slug: 1 });
estateSchema.index({ city: 1, neighborhood: 1 });
estateSchema.index({ price: 1 });
estateSchema.index({ processType: 1, estateType: 1 });
estateSchema.index({ createdAt: -1 });
estateSchema.index({ "location.lat": 1, "location.lng": 1 });

const Estate = mongoose.model("Estate", estateSchema);

module.exports = Estate;