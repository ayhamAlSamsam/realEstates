// controllers/estateOffers.controller.js
const asyncHandler = require("express-async-handler");
const estateService = require("../services/estateOffers.service");
const buildEstateQuery = require("../utils/buildEstateQuery");

const {
  createEstateSchema,
  updateEstateSchema,
  idParamSchema,
  getAllEstatesSchema,
  updateStatusSchema,
} = require("../validations/estateOffersValidation");

// ✅ دالة مساعدة لبناء المسار الكامل للملفات
const buildFileUrl = (req, filename, type = "images") => {
  if (!filename) return null;
    // ✅ إذا هو URL كامل لا تعد بناءه
  if (filename.startsWith("http")) {
    return filename;
  }
  
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${type}/${filename}`;
};

const buildFilesUrls = (req, filenames, type = "images") => {
  if (!filenames || !Array.isArray(filenames)) return [];
  return filenames.map((filename) => buildFileUrl(req, filename, type));
};

// ========== GET ALL ESTATES ==========

// controllers/estateController.js
exports.getAllEstates = asyncHandler(async (req, res, next) => {
  const rawQuery = req.query;
  console.log("Raw query:", rawQuery);

  // تنظيف القيم الفارغة
  const cleanedQuery = Object.keys(rawQuery).reduce((acc, key) => {
    const value = rawQuery[key];
    if (value !== undefined && value !== "") {
      acc[key] = value;
    }
    return acc;
  }, {});

  // تحويل search إلى keyword
  if (cleanedQuery.search) {
    cleanedQuery.keyword = cleanedQuery.search;
    delete cleanedQuery.search; // ✅ حذف search بعد التحويل
  }

  // ✅ التصحيح: أرسل cleanedQuery وليس buildEstateQuery(cleanedQuery)!
  const result = await estateService.getAllEstates(cleanedQuery);

  const estatesWithUrls = result.estates.map((estate) => ({
    ...estate,
    mainImage: buildFileUrl(req, estate.mainImage, "images"),
    images: buildFilesUrls(req, estate.images, "images"),
    files: buildFilesUrls(req, estate.files, "files"),
    videoFiles: buildFilesUrls(req, estate.videoFiles, "videos"),
  }));

  res.status(200).json({
    status: "success",
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalResults: result.total,
    results: estatesWithUrls.length,
    data: estatesWithUrls,
  });
});

// ========== GET SINGLE ESTATE ==========
exports.getEstateById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  const { error } = idParamSchema.validate({ id });
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  const estate = await estateService.getEstateById(id);

  if (!estate) {
    return res
      .status(404)
      .json({ status: "error", message: `No estate found for this ID: ${id}` });
  }

  // ✅ إضافة المسارات الكاملة للملفات
  const estateWithUrls = {
    ...estate,
    mainImage: buildFileUrl(req, estate.mainImage, "images"),
    images: buildFilesUrls(req, estate.images, "images"),
    files: buildFilesUrls(req, estate.files, "files"),
    videoFiles: buildFilesUrls(req, estate.videoFiles, "videos"), // ✅ أضف هذا
  };

  res.status(200).json({ status: "success", data: estateWithUrls });
});

// ========== CREATE ESTATE ==========
exports.createEstate = asyncHandler(async (req, res, next) => {
  let estateData = req.body;

  if (req.body.data) {
    try {
      estateData = JSON.parse(req.body.data);
    } catch (error) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid JSON data format" });
    }
  }

  // const { error, value } = createEstateSchema.validate(estateData, {
  //   abortEarly: false,
  // });

  // if (error) {
  //   return res.status(400).json({
  //     status: "error",
  //     message: "Validation error",
  //     errors: error.details.map((err) => err.message),
  //   });
  // }

  // const estate = await estateService.createEstate(value, req.files);

  const estate = await estateService.createEstate(estateData, req.files);

  // ✅ إضافة المسارات الكاملة للملفات في الرد
  const estateWithUrls = {
    ...estate.toObject(),
    mainImage: buildFileUrl(req, estate.mainImage, "images"),
    images: buildFilesUrls(req, estate.images, "images"),
    files: buildFilesUrls(req, estate.files, "files"),
    videoFiles: buildFilesUrls(req, estate.videoFiles, "videos"), // ✅ أضف هذا
  };

  res.status(201).json({
    status: "success",
    message: "Estate created successfully",
    data: estateWithUrls,
  });
});

// ========== UPDATE ESTATE ==========
exports.updateEstate = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { error: idError } = idParamSchema.validate({ id });
  if (idError) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  let updateData = req.body;
  if (req.body.data) {
    try {
      updateData = JSON.parse(req.body.data);
    } catch (error) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid JSON data format" });
    }
  }

  // const { error, value } = updateEstateSchema.validate(updateData, {
  //   abortEarly: false,
  // });
  // if (error) {
  //   return res.status(400).json({
  //     status: "error",
  //     message: "Validation error",
  //     errors: error.details.map((err) => err.message),
  //   });
  // }

  // const estate = await estateService.updateEstate(id, value, req.files);

  const estate = await estateService.updateEstate(id, updateData, req.files);
  if (!estate) {
    return res
      .status(404)
      .json({ status: "error", message: `No estate found for this ID: ${id}` });
  }

  // ✅ إضافة المسارات الكاملة للملفات في الرد
  const estateWithUrls = {
    ...estate.toObject(),
    mainImage: buildFileUrl(req, estate.mainImage, "images"),
    images: buildFilesUrls(req, estate.images, "images"),
    files: buildFilesUrls(req, estate.files, "files"),
    videoFiles: buildFilesUrls(req, estate.videoFiles, "videos"), // ✅ أضف هذا
  };

  res.status(200).json({
    status: "success",
    message: "Estate updated successfully",
    data: estateWithUrls,
  });
});

// ========== DELETE ESTATE ==========
exports.deleteEstate = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { error } = idParamSchema.validate({ id });
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  const estate = await estateService.deleteEstate(id);

  if (!estate) {
    return res
      .status(404)
      .json({ status: "error", message: `No estate found for this ID: ${id}` });
  }

  res.status(200).json({
    status: "success",
    message: "Estate deleted successfully",
    data: estate,
  });
});

// ========== UPDATE ESTATE STATUS ==========
exports.updateEstateStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { error: idError } = idParamSchema.validate({ id });
  if (idError) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  const estate = await estateService.updateStatus(id, value.status);

  if (!estate) {
    return res
      .status(404)
      .json({ status: "error", message: `No estate found for this ID: ${id}` });
  }

  res.status(200).json({
    status: "success",
    message: `Estate status updated to ${value.status}`,
    data: estate,
  });
});
