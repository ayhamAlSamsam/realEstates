// services/requestService.js
const mongoose = require("mongoose");
const Request = require("../models/estateRequestModel");
const Estate = require("../models/estateOffersModel");

class RequestService {
  // ========== GET ALL REQUESTS (Basic) ==========
  async getAllRequests(queryParams) {
    const filter = {};

    // Basic filters only
    if (queryParams.status) filter.status = queryParams.status;
    if (queryParams.email) filter["customer.email"] = queryParams.email;
    if (queryParams.city) filter["requirements.city"] = queryParams.city;

    // Pagination
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [total, requests] = await Promise.all([
      Request.countDocuments(filter),
      Request.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return {
      requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== GET SINGLE REQUEST ==========
  async getRequestById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Request.findById(id).lean();
  }

  // ========== CREATE REQUEST ==========
  async createRequest(data) {
    data.lastmodifiedDate = new Date();
    if (!data.stats) data.stats = { timesContacted: 0, totalFollowUps: 0 };
    return await Request.create(data);
  }

  // ========== UPDATE REQUEST ==========
  async updateRequest(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    updateData.lastmodifiedDate = new Date();
    return await Request.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // ========== DELETE REQUEST ==========
  async deleteRequest(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await Request.findOneAndDelete({ _id: id });
  }

  // ========== UPDATE STATUS ==========
  async updateStatus(id, status) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const updateData = { status, lastmodifiedDate: new Date() };
    if (status === "completed" || status === "cancelled")
      updateData.closedDate = new Date();
    return await Request.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // ========== MATCH REQUEST WITH ESTATE OFFERS ==========
  // ========== MATCH REQUEST WITH ESTATE OFFERS ==========
  async matchOffersForRequest(requestId) {
    if (!mongoose.Types.ObjectId.isValid(requestId)) return null;

    // 1. نجيب الطلب
    const request = await Request.findById(requestId).lean();
    if (!request) return null;

    const reqCity = request.requirements?.city;
    const reqNeighborhood = request.requirements?.neighborhood;
    const reqPrice = request.requirements?.price || {};

    // السعر ضروري للمطابقة
    if (
      !reqPrice.minSYP &&
      !reqPrice.maxSYP &&
      !reqPrice.minUSD &&
      !reqPrice.maxUSD
    ) {
      throw new Error(
        "Request must have at least one price range (SYP or USD) to match",
      );
    }

    // 2. نبني فلتر التطابق
    const matchFilter = {
      status: { $ne: "closed" },
      $or: [],
    };

    // المدينة والحي: فلتر اختياري إذا موجودين
    if (reqCity?.trim()) {
      matchFilter.city = { $regex: new RegExp(`^${reqCity.trim()}$`, "i") };
    }

    if (reqNeighborhood?.trim()) {
      matchFilter.neighborhood = {
        $regex: new RegExp(`^${reqNeighborhood.trim()}$`, "i"),
      };
    }

    // 3. شروط السعر (أساسية)
    const priceConditions = [];

    // تطابق الليرة السورية
    if (reqPrice.minSYP != null || reqPrice.maxSYP != null) {
      const sypCondition = {};

      if (reqPrice.minSYP != null && reqPrice.maxSYP != null) {
        sypCondition.$and = [
          { "price.minSYP": { $lte: reqPrice.maxSYP } },
          { "price.maxSYP": { $gte: reqPrice.minSYP } },
        ];
      } else if (reqPrice.minSYP != null) {
        sypCondition["price.maxSYP"] = { $gte: reqPrice.minSYP };
      } else if (reqPrice.maxSYP != null) {
        sypCondition["price.minSYP"] = { $lte: reqPrice.maxSYP };
      }

      if (Object.keys(sypCondition).length > 0) {
        priceConditions.push(sypCondition);
      }
    }

    // تطابق الدولار
    if (reqPrice.minUSD != null || reqPrice.maxUSD != null) {
      const usdCondition = {};

      if (reqPrice.minUSD != null && reqPrice.maxUSD != null) {
        usdCondition.$and = [
          { "price.minUSD": { $lte: reqPrice.maxUSD } },
          { "price.maxUSD": { $gte: reqPrice.minUSD } },
        ];
      } else if (reqPrice.minUSD != null) {
        usdCondition["price.maxUSD"] = { $gte: reqPrice.minUSD };
      } else if (reqPrice.maxUSD != null) {
        usdCondition["price.minUSD"] = { $lte: reqPrice.maxUSD };
      }

      if (Object.keys(usdCondition).length > 0) {
        priceConditions.push(usdCondition);
      }
    }

    matchFilter.$or = priceConditions;

    // 4. ننفذ البحث
    const matchedOffers = await mongoose
      .model("Estate")
      .find(matchFilter)
      .lean();

    return {
      request: {
        _id: request._id,
        requestNumber: request.requestNumber,
        customer: request.customer,
        requirements: request.requirements,
      },
      matchedOffers,
      totalMatches: matchedOffers.length,
    };
  }
}

module.exports = new RequestService();
