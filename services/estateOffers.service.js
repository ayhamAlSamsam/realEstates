// services/estateService.js
const mongoose = require("mongoose");
const Estate = require("../models/estateOffersModel");
const buildEstateQuery = require("../utils/buildEstateQuery"); // ✅ استدعاء دالة الفلترة الموحدة

class EstateService {
  // ========== GET ALL ESTATES (UPDATED) ==========
  async getAllEstates(queryParams) {
    const filters = {};

    if (queryParams.keyword) filters.keyword = queryParams.keyword;
    if (queryParams.city) filters.city = queryParams.city;
    if (queryParams.neighborhood)
      filters.neighborhood = queryParams.neighborhood;
    if (queryParams.processType) filters.processType = queryParams.processType;
    if (queryParams.status && queryParams.status !== "All")
      filters.status = queryParams.status;

    // ✅ نوع العقار
    if (queryParams.estateType) {
      filters.type = [queryParams.estateType];
    }

    // ✅ bedrooms → rooms (لأن buildEstateQuery تنتظر rooms)
    if (queryParams.bedrooms) {
      filters.rooms = [parseInt(queryParams.bedrooms)];
    }

    // ✅ bathrooms
    if (queryParams.bathrooms) {
      filters.bathrooms = parseInt(queryParams.bathrooms);
    }

    // ✅ Boolean values
    if (queryParams.isFeatured !== undefined) {
      filters.isFeatured =
        queryParams.isFeatured === "true" || queryParams.isFeatured === true;
    }

    if (queryParams.isUrgent !== undefined) {
      filters.isUrgent =
        queryParams.isUrgent === "true" || queryParams.isUrgent === true;
    }

    // ✅ السعر
    if (queryParams.minPrice || queryParams.maxPrice) {
      filters.price = {};
      if (queryParams.minPrice)
        filters.price.min = parseFloat(queryParams.minPrice);
      if (queryParams.maxPrice)
        filters.price.max = parseFloat(queryParams.maxPrice);
    }

    // ✅ المساحة
    if (queryParams.minSpace) {
      filters.minSpace = parseFloat(queryParams.minSpace);
    }
    if (queryParams.maxSpace) {
      filters.maxSpace = parseFloat(queryParams.maxSpace);
    }

    // ✅ تنظيف القيم الفارغة
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] === undefined ||
        filters[key] === null ||
        filters[key] === ""
      ) {
        delete filters[key];
      }
      if (Array.isArray(filters[key]) && filters[key].length === 0) {
        delete filters[key];
      }
      if (key === "price" && !filters.price?.min && !filters.price?.max) {
        delete filters.price;
      }
      if ((key === "minSpace" || key === "maxSpace") && !filters[key]) {
        delete filters[key];
      }
    });

    // ✅ بناء الاستعلام باستخدام buildEstateQuery
    const query = buildEstateQuery(filters);

    // ✅ للتصحيح - تأكد من الاستعلام
    console.log("🔍 Built query:", JSON.stringify(query));

    // ========== Pagination ==========
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // ========== Sorting ==========
    const sortField = queryParams.sort || "createdAt";
    const sortOrder = queryParams.order === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // ========== تنفيذ الاستعلامات المتوازية ==========
    const [total, estates] = await Promise.all([
      Estate.countDocuments(query),
      Estate.find(query).skip(skip).limit(limit).sort(sort).lean(),
    ]);

    // ========== إرجاع النتيجة ==========
    return {
      estates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  // ========== باقي الدوال كما هي ==========

  async getEstateById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const estate = await Estate.findById(id).lean();

    if (estate) {
      // زيادة عدد المشاهدات (اختياري)
      await Estate.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    return estate;
  }

  async createEstate(data, files = null) {
    if (files) {
      if (files.mainImage) {
        data.mainImage = files.mainImage[0].filename;
      }
      if (files.images) {
        data.images = files.images.map((file) => file.filename);
      }
      if (files.files) {
        data.files = files.files.map((file) => file.filename);
      }
      if (files.videoFiles) {
        data.videoFiles = files.videoFiles.map((file) => file.filename);
      }
    }

    data.totalRooms = (data.bedrooms || 0) + (data.livingRooms || 0);

    if (data.totalSpace && data.price && data.totalSpace > 0) {
      data.pricePerMeter = data.price / data.totalSpace;
    }

    const estate = await Estate.create(data);
    return estate;
  }

  async updateEstate(id, updateData, files = null) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    if (files) {
      if (files.mainImage) {
        updateData.mainImage = files.mainImage[0].filename;
      }
      if (files.images) {
        updateData.images = files.images.map((file) => file.filename);
      }
      if (files.files) {
        updateData.files = files.files.map((file) => file.filename);
      }
      if (files.videoFiles) {
        updateData.videoFiles = files.videoFiles.map((file) => file.filename);
      }
    }

    updateData.lastModifiedDate = new Date();

    const currentEstate = await Estate.findById(id);
    if (!currentEstate) {
      return null;
    }

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

    const estate = await Estate.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return estate;
  }

  async deleteEstate(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const estate = await Estate.findOneAndDelete({ _id: id });
    return estate;
  }

  async updateStatus(id, status) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const updateData = { status };

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
