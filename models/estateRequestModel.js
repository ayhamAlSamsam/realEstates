  // models/requestModel.js
  const mongoose = require("mongoose");


  const requestSchema = new mongoose.Schema(
    {
      // ========== REQUEST BASIC INFORMATION ==========
      requestNumber: {
        type: String,
        unique: true,
        default: () => `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      },

      // ========== CUSTOMER INFORMATION ==========
      customer: {
        name: {
          type: String,
          // required: true,
          trim: true,
        },
        email: {
          type: String,
          // required: true,
          lowercase: true,
        },
        phone: {
          type: String,
          // required: true,
          trim: true,
        },
        alternativePhone: String,
        address: String,
      },

      // ========== PROPERTY REQUIREMENTS ==========
      requirements: {
        // نوع العقار (dropdown)
        estateTypes: [
          {
            type: String,
            enum: [
              "apartment",
              "villa",
              "house",
              "duplex",
              "penthouse",
              "studio",
              "commercial",
              "land",
            ],
          },
        ],

        // نوع العملية (dropdown)
        processType: {
          type: String,
          enum: ["for_sale", "for_rent", "for_lease"],
        },

        employeebarcode: String,

        city: String,
        neighborhood: String,

        floorNumber: Number,

        // المساحة
        minSpace: Number,
        maxSpace: Number,

        // الغرف
        minRooms: Number,
        maxRooms: Number,

        // السعر (ليرتين)
        price: {
          minSYP: Number,
          maxSYP: Number,
          minUSD: Number,
          maxUSD: Number,
        },

        // طريقة الدفع
        paymentType: {
          type: String,
          enum: ["cash", "installment", "other"],
        },
        paymentDetails: String,

        // حالة العقار
        propertyCondition: {
          type: String,
          enum: [
            "new",
            "excellent",
            "good",
            "needs_renovation",
            "luxury",
            "shell",
          ],
        },

        // الفرش
        furnishingType: {
          type: String,
          enum: ["furnished", "unfurnished", "semi_furnished"],
        },

        // الاتجاهات (tags)
        directions: [String],

        // الواجهة
        facade: String,

        // المميزات (tags)
        features: [String],
      },

      // ========== DATES ==========
      requestDate: {
        type: Date,
        default: Date.now,
      },
      closedDate: Date,
      lastmodifiedDate: Date,

      // ========== STATISTICS ==========
      stats: {
        timesContacted: { type: Number, default: 0 },
        totalFollowUps: { type: Number, default: 0 },
      },
    },
    {
      timestamps: true,
    }
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
