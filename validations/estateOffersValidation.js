// validations/estateValidation.js
const Joi = require("joi");
const mongoose = require("mongoose");

// ========== HELPER FUNCTION ==========
// التحقق من أن الـ ID صالح لـ MongoDB
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid", { message: "Invalid ID format" });
  }
  return value;
};

// ========== 1. CREATE ESTATE VALIDATION ==========
const createEstateSchema = Joi.object({
  // BASIC INFORMATION
  title: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 5 characters",
    "string.max": "Title cannot exceed 200 characters",
  }),

  // PROCESS TYPE
  processType: Joi.string()
    .valid("for_sale", "for_rent", "for_lease", "sold", "rented")
    .default("for_sale"),

  // PROPERTY TYPE
  estateType: Joi.string()
    .valid(
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
      "warehouse"
    )
    .required()
    .messages({
      "any.required": "Estate type is required",
      "any.only": "Invalid estate type",
    }),

  // LOCATION
  city: Joi.string().trim().required().messages({
    "string.empty": "City is required",
  }),
  neighborhood: Joi.string().trim().required().messages({
    "string.empty": "Neighborhood is required",
  }),
  address: Joi.string().trim().optional(),

  // MAP COORDINATES
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).optional(),
    lng: Joi.number().min(-180).max(180).optional(),
  }).optional(),
  mapUrl: Joi.string().uri().optional(),

  // SPACE & AREA
  totalSpace: Joi.number().positive().required().messages({
    "number.positive": "Total space must be greater than 0",
    "any.required": "Total space is required",
  }),
  builtArea: Joi.number().min(0).default(0),
  landArea: Joi.number().min(0).default(0),
  areaUnit: Joi.string().valid("sqm", "sqft").default("sqm"),

  // ROOMS
  bedrooms: Joi.number().min(0).max(20).default(0),
  bathrooms: Joi.number().min(0).max(15).default(0),
  livingRooms: Joi.number().min(0).default(1),

  // FLOOR INFORMATION
  floorNumber: Joi.number().allow(null).optional(),
  totalFloors: Joi.number().allow(null).optional(),
  hasElevator: Joi.boolean().default(false),

  // PRICE
  price: Joi.number().positive().required().messages({
    "number.positive": "Price must be greater than 0",
    "any.required": "Price is required",
  }),
  currency: Joi.string()
    .valid("USD", "EUR", "GBP", "TRY", "AED", "SAR", "EGP", "JOD")
    .default("USD"),
  isNegotiable: Joi.boolean().default(false),

  // PAYMENT TYPE
  paymentType: Joi.string()
    .valid("cash", "installment", "mortgage", "bank_finance", "all")
    .default("all"),
  downPayment: Joi.number().min(0).max(100).default(0),
  installmentMonths: Joi.number().min(0).default(0),

  // DESCRIPTION
  description: Joi.string().max(5000).required().messages({
    "string.max": "Description cannot exceed 5000 characters",
    "any.required": "Description is required",
  }),
  shortDescription: Joi.string().max(300).optional(),

  // FEATURES (Amenities)
  features: Joi.object({
    hasBalcony: Joi.boolean().default(false),
    hasGarden: Joi.boolean().default(false),
    hasPool: Joi.boolean().default(false),
    hasGarage: Joi.boolean().default(false),
    hasParking: Joi.boolean().default(false),
    hasStorage: Joi.boolean().default(false),
    hasAC: Joi.boolean().default(false),
    hasHeating: Joi.boolean().default(false),
    hasFurnished: Joi.boolean().default(false),
    hasSecurity: Joi.boolean().default(false),
    hasJacuzzi: Joi.boolean().default(false),
    hasSauna: Joi.boolean().default(false),
    hasGym: Joi.boolean().default(false),
    hasSeaView: Joi.boolean().default(false),
    hasLandmarkView: Joi.boolean().default(false),
    isPetFriendly: Joi.boolean().default(false),
  }).optional(),

  // CONDITION & AGE
  propertyCondition: Joi.string()
    .valid("new", "excellent", "good", "needs_renovation", "under_construction")
    .default("good"),
  yearBuilt: Joi.number().min(1800).max(new Date().getFullYear()).optional(),
  furnishingStatus: Joi.string()
    .valid("unfurnished", "semi_furnished", "fully_furnished")
    .default("unfurnished"),

  // MEDIA
  mainImage: Joi.string().uri().required().messages({
    "any.required": "Main image is required",
  }),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        caption: Joi.string().optional(),
        isMain: Joi.boolean().default(false),
      })
    )
    .optional(),
  videoUrl: Joi.string().uri().optional(),
  virtualTourUrl: Joi.string().uri().optional(),

  // CONTACT INFO
  agentName: Joi.string().trim().optional(),
  agentPhone: Joi.string().trim().optional(),
  agentEmail: Joi.string().email().optional(),

  // DATES
  listingExpiryDate: Joi.date().greater("now").optional(),
  closedDate: Joi.date().optional(),

  // OWNER
  ownerName: Joi.string().optional(),
  ownerNumber: Joi.string().optional(),

  // NEARBY PLACES
  nearbyPlaces: Joi.object({
    schools: Joi.number().min(0).default(0),
    hospitals: Joi.number().min(0).default(0),
    malls: Joi.number().min(0).default(0),
    restaurants: Joi.number().min(0).default(0),
    metro: Joi.number().min(0).default(0),
  }).optional(),
});

// ========== 2. UPDATE ESTATE VALIDATION ==========
// كل الحقول اختيارية لأنها تحديث جزئي
const updateEstateSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  processType: Joi.string().valid("for_sale", "for_rent", "for_lease", "sold", "rented"),
  estateType: Joi.string().valid(
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
    "warehouse"
  ),
  city: Joi.string().trim(),
  neighborhood: Joi.string().trim(),
  address: Joi.string().trim(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90),
    lng: Joi.number().min(-180).max(180),
  }),
  mapUrl: Joi.string().uri(),
  totalSpace: Joi.number().positive(),
  builtArea: Joi.number().min(0),
  landArea: Joi.number().min(0),
  areaUnit: Joi.string().valid("sqm", "sqft"),
  bedrooms: Joi.number().min(0).max(20),
  bathrooms: Joi.number().min(0).max(15),
  livingRooms: Joi.number().min(0),
  floorNumber: Joi.number().allow(null),
  totalFloors: Joi.number().allow(null),
  hasElevator: Joi.boolean(),
  price: Joi.number().positive(),
  currency: Joi.string().valid("USD", "EUR", "GBP", "TRY", "AED", "SAR", "EGP", "JOD"),
  isNegotiable: Joi.boolean(),
  paymentType: Joi.string().valid("cash", "installment", "mortgage", "bank_finance", "all"),
  downPayment: Joi.number().min(0).max(100),
  installmentMonths: Joi.number().min(0),
  description: Joi.string().max(5000),
  shortDescription: Joi.string().max(300),
  features: Joi.object({
    hasBalcony: Joi.boolean(),
    hasGarden: Joi.boolean(),
    hasPool: Joi.boolean(),
    hasGarage: Joi.boolean(),
    hasParking: Joi.boolean(),
    hasStorage: Joi.boolean(),
    hasAC: Joi.boolean(),
    hasHeating: Joi.boolean(),
    hasFurnished: Joi.boolean(),
    hasSecurity: Joi.boolean(),
    hasJacuzzi: Joi.boolean(),
    hasSauna: Joi.boolean(),
    hasGym: Joi.boolean(),
    hasSeaView: Joi.boolean(),
    hasLandmarkView: Joi.boolean(),
    isPetFriendly: Joi.boolean(),
  }),
  propertyCondition: Joi.string().valid("new", "excellent", "good", "needs_renovation", "under_construction"),
  yearBuilt: Joi.number().min(1800).max(new Date().getFullYear()),
  furnishingStatus: Joi.string().valid("unfurnished", "semi_furnished", "fully_furnished"),
  mainImage: Joi.string().uri(),
  images: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      caption: Joi.string(),
      isMain: Joi.boolean(),
    })
  ),
  videoUrl: Joi.string().uri(),
  virtualTourUrl: Joi.string().uri(),
  agentName: Joi.string().trim(),
  agentPhone: Joi.string().trim(),
  agentEmail: Joi.string().email(),
  listingExpiryDate: Joi.date(),
  closedDate: Joi.date(),
  ownerName: Joi.string(),
  ownerNumber: Joi.string(),
  nearbyPlaces: Joi.object({
    schools: Joi.number().min(0),
    hospitals: Joi.number().min(0),
    malls: Joi.number().min(0),
    restaurants: Joi.number().min(0),
    metro: Joi.number().min(0),
  }),
  status: Joi.string().valid("active", "inactive", "pending", "sold", "rented"),
  isVerified: Joi.boolean(),
  isFeatured: Joi.boolean(),
  isUrgent: Joi.boolean(),
}); 

// ========== 3. ID PARAM VALIDATION ==========
const idParamSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId, "ObjectId Validation").required().messages({
    "any.required": "ID is required",
    "any.invalid": "Invalid ID format",
  }),
});

// ========== 4. GET ALL ESTATES VALIDATION (Query Parameters) ==========
const getAllEstatesSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sort: Joi.string().valid("price", "createdAt", "updatedAt", "views", "totalSpace").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  city: Joi.string().optional(),
  neighborhood: Joi.string().optional(),
  processType: Joi.string().valid("for_sale", "for_rent", "for_lease", "sold", "rented"),
  estateType: Joi.string().valid(
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
    "warehouse"
  ),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  minSpace: Joi.number().min(0),
  maxSpace: Joi.number().min(0),
  bedrooms: Joi.number().min(0).max(20),
  bathrooms: Joi.number().min(0).max(15),
  status: Joi.string().valid("active", "inactive", "pending", "sold", "rented"),
  isFeatured: Joi.boolean(),
  isUrgent: Joi.boolean(),
}).custom((value, helpers) => {
  // التأكد أن minPrice <= maxPrice
  if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
    return helpers.error("any.custom", { message: "minPrice cannot be greater than maxPrice" });
  }
  if (value.minSpace && value.maxSpace && value.minSpace > value.maxSpace) {
    return helpers.error("any.custom", { message: "minSpace cannot be greater than maxSpace" });
  }
  return value;
});

// ========== 5. UPDATE STATUS VALIDATION ==========
const updateStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive", "pending", "sold", "rented").required().messages({
    "any.required": "Status is required",
    "any.only": "Invalid status value",
  }),
});

// ========== 6. UPDATE FEATURED VALIDATION ==========
const updateFeaturedSchema = Joi.object({
  isFeatured: Joi.boolean().required(),
  featuredUntilDate: Joi.date().greater("now").optional(),
});

// ========== EXPORT ALL VALIDATIONS ==========
module.exports = {
  createEstateSchema,
  updateEstateSchema,
  idParamSchema,
  getAllEstatesSchema,
  updateStatusSchema,
  updateFeaturedSchema,
};