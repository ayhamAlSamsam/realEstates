// validations/requestValidation.js
const Joi = require("joi");
const mongoose = require("mongoose");

// ========== HELPER FUNCTION ==========
// Validate MongoDB ObjectId
const isValidObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid", { message: "Invalid ID format" });
  }
  return value;
};

// ========== 1. CREATE REQUEST VALIDATION ==========
const createRequestSchema = Joi.object({
  // CUSTOMER INFORMATION (All required)
  customer: Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Customer name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 100 characters",
      "any.required": "Customer name is required",
    }),

    email: Joi.string().email().lowercase().required().messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

    phone: Joi.string()
      .trim()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(8)
      .max(20)
      .required()
      .messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Please enter a valid phone number",
        "any.required": "Phone number is required",
      }),

    alternativePhone: Joi.string()
      .trim()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(8)
      .max(20)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "Please enter a valid alternative phone number",
      }),

    address: Joi.string().trim().max(500).optional().allow(""),
  })
    .required()
    .messages({
      "any.required": "Customer information is required",
    }),

  // PROPERTY REQUIREMENTS
  requirements: Joi.object({
    estateTypes: Joi.array()
      .items(
        Joi.string().valid(
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
        ),
      )
      .min(1)
      .max(5)
      .messages({
        "array.min": "At least one estate type is required",
        "any.only": "Invalid estate type",
      }),

    processType: Joi.string()
      .valid("for_sale", "for_rent", "for_lease")
      .required()
      .messages({
        "any.required": "Process type is required",
        "any.only": "Process type must be for_sale, for_rent, or for_lease",
      }),

    employeebarcode: Joi.string().trim().optional().allow(""),

    city: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "City is required",
      "any.required": "City is required",
    }),

    neighborhood: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Neighborhood is required",
      "any.required": "Neighborhood is required",
    }),

    floorNumber: Joi.number().min(0).max(100).optional().allow(null),

    minSpace: Joi.number().min(0).max(10000).optional().allow(null),
    maxSpace: Joi.number().min(0).max(10000).optional().allow(null),

    minRooms: Joi.number().min(0).max(20).optional().allow(null),
    maxRooms: Joi.number().min(0).max(20).optional().allow(null),

    minPrice: Joi.number().min(0).max(100000000).optional().allow(null),
    maxPrice: Joi.number().min(0).max(100000000).optional().allow(null),

    currency: Joi.string()
      .valid("USD", "EUR", "GBP", "TRY", "AED", "SAR", "EGP", "JOD")
      .default("USD"),

    requiredFeatures: Joi.object({
      hasBalcony: Joi.boolean().default(false),
      hasGarden: Joi.boolean().default(false),
      hasPool: Joi.boolean().default(false),
      hasGarage: Joi.boolean().default(false),
      hasParking: Joi.boolean().default(false),
      hasFurnished: Joi.boolean().default(false),
      hasSeaView: Joi.boolean().default(false),
      hasLandmarkView: Joi.boolean().default(false),
      isPetFriendly: Joi.boolean().default(false),
    }).optional(),

    propertyCondition: Joi.string()
      .valid("new", "excellent", "good", "needs_renovation")
      .optional(),

    paymentType: Joi.string()
      .valid("cash", "installment", "mortgage", "bank_finance")
      .optional(),
  })
    .required()
    .messages({
      "any.required": "Property requirements are required",
    }),

  status: Joi.string()
    .valid(
      "pending",
      "in_review",
      "contacted",
      "in_progress",
      "completed",
      "cancelled",
    )
    .default("pending"),

  requestDate: Joi.date().default(Date.now),
  closedDate: Joi.date().optional().allow(null),
  lastmodifiedDate: Joi.date().optional().allow(null),

  stats: Joi.object({
    timesContacted: Joi.number().min(0).default(0),
    totalFollowUps: Joi.number().min(0).default(0),
  }).optional(),
}).custom((value, helpers) => {
  // Validate: minPrice <= maxPrice
  const minPrice = value.requirements?.minPrice;
  const maxPrice = value.requirements?.maxPrice;

  if (
    minPrice !== null &&
    maxPrice !== null &&
    minPrice !== undefined &&
    maxPrice !== undefined
  ) {
    if (minPrice > maxPrice) {
      return helpers.error("any.custom", {
        message: "Minimum price cannot be greater than maximum price",
      });
    }
  }

  // Validate: minSpace <= maxSpace
  const minSpace = value.requirements?.minSpace;
  const maxSpace = value.requirements?.maxSpace;

  if (
    minSpace !== null &&
    maxSpace !== null &&
    minSpace !== undefined &&
    maxSpace !== undefined
  ) {
    if (minSpace > maxSpace) {
      return helpers.error("any.custom", {
        message: "Minimum space cannot be greater than maximum space",
      });
    }
  }

  // Validate: minRooms <= maxRooms
  const minRooms = value.requirements?.minRooms;
  const maxRooms = value.requirements?.maxRooms;

  if (
    minRooms !== null &&
    maxRooms !== null &&
    minRooms !== undefined &&
    maxRooms !== undefined
  ) {
    if (minRooms > maxRooms) {
      return helpers.error("any.custom", {
        message: "Minimum rooms cannot be greater than maximum rooms",
      });
    }
  }

  return value;
});

// ========== 2. UPDATE REQUEST VALIDATION ==========
// All fields are optional for partial update
const updateRequestSchema = Joi.object({
  customer: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().email().lowercase(),
    phone: Joi.string()
      .trim()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(8)
      .max(20),
    alternativePhone: Joi.string()
      .trim()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(8)
      .max(20)
      .allow(""),
    address: Joi.string().trim().max(500).allow(""),
  }),

  requirements: Joi.object({
    estateTypes: Joi.array()
      .items(
        Joi.string().valid(
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
        ),
      )
      .min(1)
      .max(5),

    processType: Joi.string().valid("for_sale", "for_rent", "for_lease"),
    employeebarcode: Joi.string().trim().allow(""),
    city: Joi.string().trim().min(2).max(100),
    neighborhood: Joi.string().trim().min(2).max(100),
    floorNumber: Joi.number().min(0).max(100).allow(null),
    minSpace: Joi.number().min(0).max(10000).allow(null),
    maxSpace: Joi.number().min(0).max(10000).allow(null),
    minRooms: Joi.number().min(0).max(20).allow(null),
    maxRooms: Joi.number().min(0).max(20).allow(null),
    minPrice: Joi.number().min(0).max(100000000).allow(null),
    maxPrice: Joi.number().min(0).max(100000000).allow(null),
    currency: Joi.string().valid(
      "USD",
      "EUR",
      "GBP",
      "TRY",
      "AED",
      "SAR",
      "EGP",
      "JOD",
    ),
    requiredFeatures: Joi.object({
      hasBalcony: Joi.boolean(),
      hasGarden: Joi.boolean(),
      hasPool: Joi.boolean(),
      hasGarage: Joi.boolean(),
      hasParking: Joi.boolean(),
      hasFurnished: Joi.boolean(),
      hasSeaView: Joi.boolean(),
      hasLandmarkView: Joi.boolean(),
      isPetFriendly: Joi.boolean(),
    }),
    propertyCondition: Joi.string().valid(
      "new",
      "excellent",
      "good",
      "needs_renovation",
    ),
    paymentType: Joi.string().valid(
      "cash",
      "installment",
      "mortgage",
      "bank_finance",
    ),
  }),

  status: Joi.string().valid(
    "pending",
    "in_review",
    "contacted",
    "in_progress",
    "completed",
    "cancelled",
  ),

  requestDate: Joi.date(),
  closedDate: Joi.date().allow(null),
  lastmodifiedDate: Joi.date().allow(null),

  stats: Joi.object({
    timesContacted: Joi.number().min(0),
    totalFollowUps: Joi.number().min(0),
  }),
}).custom((value, helpers) => {
  // Same validation logic as create, but only for fields that exist
  const minPrice = value.requirements?.minPrice;
  const maxPrice = value.requirements?.maxPrice;
  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice !== null &&
    maxPrice !== null
  ) {
    if (minPrice > maxPrice) {
      return helpers.error("any.custom", {
        message: "Minimum price cannot be greater than maximum price",
      });
    }
  }

  const minSpace = value.requirements?.minSpace;
  const maxSpace = value.requirements?.maxSpace;
  if (
    minSpace !== undefined &&
    maxSpace !== undefined &&
    minSpace !== null &&
    maxSpace !== null
  ) {
    if (minSpace > maxSpace) {
      return helpers.error("any.custom", {
        message: "Minimum space cannot be greater than maximum space",
      });
    }
  }

  const minRooms = value.requirements?.minRooms;
  const maxRooms = value.requirements?.maxRooms;
  if (
    minRooms !== undefined &&
    maxRooms !== undefined &&
    minRooms !== null &&
    maxRooms !== null
  ) {
    if (minRooms > maxRooms) {
      return helpers.error("any.custom", {
        message: "Minimum rooms cannot be greater than maximum rooms",
      });
    }
  }

  return value;
});

// ========== 3. ID PARAM VALIDATION ==========
const idParamSchema = Joi.object({
  id: Joi.string()
    .custom(isValidObjectId, "ObjectId Validation")
    .required()
    .messages({
      "any.required": "ID is required",
      "any.invalid": "Invalid ID format",
    }),
});

// ========== 4. GET ALL REQUESTS VALIDATION (Query Parameters) ==========
const getAllRequestsSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sort: Joi.string()
    .valid("requestDate", "createdAt", "updatedAt", "status")
    .default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),

  // Filters
  status: Joi.string().valid(
    "pending",
    "in_review",
    "contacted",
    "in_progress",
    "completed",
    "cancelled",
  ),
  processType: Joi.string().valid("for_sale", "for_rent", "for_lease"),
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
    "warehouse",
  ),
  city: Joi.string().trim(),
  neighborhood: Joi.string().trim(),

  // Price range
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),

  // Space range
  minSpace: Joi.number().min(0),
  maxSpace: Joi.number().min(0),

  // Rooms range
  minRooms: Joi.number().min(0),
  maxRooms: Joi.number().min(0),

  // Search by email or request number
  email: Joi.string().email(),
  requestNumber: Joi.string(),

  // Date range
  fromDate: Joi.date(),
  toDate: Joi.date(),
}).custom((value, helpers) => {
  // Validate range logic
  if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
    return helpers.error("any.custom", {
      message: "Minimum price cannot be greater than maximum price",
    });
  }
  if (value.minSpace && value.maxSpace && value.minSpace > value.maxSpace) {
    return helpers.error("any.custom", {
      message: "Minimum space cannot be greater than maximum space",
    });
  }
  if (value.minRooms && value.maxRooms && value.minRooms > value.maxRooms) {
    return helpers.error("any.custom", {
      message: "Minimum rooms cannot be greater than maximum rooms",
    });
  }
  if (value.fromDate && value.toDate && value.fromDate > value.toDate) {
    return helpers.error("any.custom", {
      message: "Start date cannot be after end date",
    });
  }
  return value;
});

// ========== 5. UPDATE REQUEST STATUS VALIDATION ==========
const updateRequestStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "in_review",
      "contacted",
      "in_progress",
      "completed",
      "cancelled",
    )
    .required()
    .messages({
      "any.required": "Status is required",
      "any.only": "Invalid status value",
    }),
  closedDate: Joi.when("status", {
    is: "completed",
    then: Joi.date().required().messages({
      "any.required": "Closed date is required when status is completed",
    }),
    otherwise: Joi.date().optional().allow(null),
  }),
});

// ========== 6. UPDATE REQUEST STATS VALIDATION ==========
const updateRequestStatsSchema = Joi.object({
  type: Joi.string().valid("contact", "followup").required().messages({
    "any.required": "Stats type is required",
    "any.only": "Type must be 'contact' or 'followup'",
  }),
});

// ========== 7. GET BY REQUEST NUMBER VALIDATION ==========
const getByRequestNumberSchema = Joi.object({
  requestNumber: Joi.string()
    .pattern(/^REQ-\d+-\d+$/)
    .required()
    .messages({
      "string.empty": "Request number is required",
      "string.pattern.base":
        "Invalid request number format (example: REQ-1234567890-123)",
      "any.required": "Request number is required",
    }),
});

// ========== EXPORT ALL VALIDATIONS ==========
module.exports = {
  createRequestSchema,
  updateRequestSchema,
  idParamSchema,
  getAllRequestsSchema,
  updateRequestStatusSchema,
  updateRequestStatsSchema,
  getByRequestNumberSchema,
};
