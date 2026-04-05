// services/estateService.js
const mongoose = require("mongoose");
const Estate = require("../models/estateOffersModel");

class EstateService {
  // ========== GET ALL ESTATES ==========
  async getAllEstates(queryParams) {
    // بناء الفلتر
    const filter = {};

    if (queryParams.city) filter.city = queryParams.city;
    if (queryParams.neighborhood)
      filter.neighborhood = queryParams.neighborhood;
    if (queryParams.processType) filter.processType = queryParams.processType;
    if (queryParams.estateType) filter.estateType = queryParams.estateType;
    if (queryParams.bedrooms) filter.bedrooms = queryParams.bedrooms;
    if (queryParams.bathrooms) filter.bathrooms = queryParams.bathrooms;
    if (queryParams.isFeatured !== undefined)
      filter.isFeatured = queryParams.isFeatured;
    if (queryParams.isUrgent !== undefined)
      filter.isUrgent = queryParams.isUrgent;

    // فلترة السعر
    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.price = {};
      if (queryParams.minPrice) filter.price.$gte = queryParams.minPrice;
      if (queryParams.maxPrice) filter.price.$lte = queryParams.maxPrice;
    }

    // فلترة المساحة
    if (queryParams.minSpace || queryParams.maxSpace) {
      filter.totalSpace = {};
      if (queryParams.minSpace) filter.totalSpace.$gte = queryParams.minSpace;
      if (queryParams.maxSpace) filter.totalSpace.$lte = queryParams.maxSpace;
    }

    // البحث بالكلمة المفتاحية (keyword)
    if (queryParams.keyword) {
      filter.$or = [
        { title: { $regex: queryParams.keyword, $options: "i" } },
        { description: { $regex: queryParams.keyword, $options: "i" } },
        { city: { $regex: queryParams.keyword, $options: "i" } },
        { neighborhood: { $regex: queryParams.keyword, $options: "i" } },
      ];
    }

    // Pagination
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = queryParams.sort || "createdAt";
    const sortOrder = queryParams.order === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // تنفيذ الاستعلامات المتوازية
    const [total, estates] = await Promise.all([
      Estate.countDocuments(filter),
      Estate.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean(),
    ]);

    return {
      estates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== GET SINGLE ESTATE ==========
  async getEstateById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const estate = await Estate.findById(id)
      .lean();

    if (estate) {
      // زيادة عدد المشاهدات (اختياري - يمكن عملها بشكل غير متزامن)
      await Estate.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    return estate;
  }

  // ========== CREATE ESTATE ==========
  async createEstate(data) {
    data.totalRooms = (data.bedrooms || 0) + (data.livingRooms || 0);

    // حساب pricePerMeter
    if (data.totalSpace && data.price && data.totalSpace > 0) {
      data.pricePerMeter = data.price / data.totalSpace;
    }

    // إنشاء الكود الفريد
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    data.code = `PRP-${timestamp}-${random}`;

    // إنشاء العقار
    const estate = await Estate.create(data);
    return estate;
  }

  // ========== UPDATE ESTATE ==========
  async updateEstate(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    // إضافة تاريخ آخر تعديل
    updateData.lastModifiedDate = new Date();

    // جلب البيانات الحالية للحسابات
    const currentEstate = await Estate.findById(id);
    if (!currentEstate) {
      return null;
    }

    // حساب totalRooms إذا تغيرت bedrooms أو livingRooms
    if (
      updateData.bedrooms !== undefined ||
      updateData.livingRooms !== undefined
    ) {
      const bedrooms =
        updateData.bedrooms !== undefined
          ? updateData.bedrooms
          : currentEstate.bedrooms;
      const livingRooms =
        updateData.livingRooms !== undefined
          ? updateData.livingRooms
          : currentEstate.livingRooms;
      updateData.totalRooms = bedrooms + livingRooms;
    }

    // حساب pricePerMeter إذا تغير price أو totalSpace
    if (updateData.price !== undefined || updateData.totalSpace !== undefined) {
      const price =
        updateData.price !== undefined ? updateData.price : currentEstate.price;
      const totalSpace =
        updateData.totalSpace !== undefined
          ? updateData.totalSpace
          : currentEstate.totalSpace;
      if (totalSpace && price && totalSpace > 0) {
        updateData.pricePerMeter = price / totalSpace;
      }
    }

    // تحديث العقار
    const estate = await Estate.findOneAndUpdate({ _id: id }, updateData, {
      new: true,
      runValidators: true,
    });

    return estate;
  }

  // ========== DELETE ESTATE ==========
  async deleteEstate(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const estate = await Estate.findOneAndDelete({ _id: id });
    return estate;
  }

  // ========== UPDATE STATUS ==========
  async updateStatus(id, status) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const updateData = { status };

    // إذا تم البيع أو التأجير، أضف تاريخ الإغلاق
    if (status === "sold" || status === "rented") {
      updateData.closedDate = new Date();
    }

    const estate = await Estate.findOneAndUpdate({ _id: id }, updateData, {
      new: true,
      runValidators: true,
    });

    return estate;
  }
}

module.exports = new EstateService();
