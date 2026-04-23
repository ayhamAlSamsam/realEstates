// services/requestService.js
const mongoose = require("mongoose");
const Request = require("../models/estateRequestModel");

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
}

module.exports = new RequestService();
