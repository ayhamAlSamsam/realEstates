const asyncHandler = require("express-async-handler");
const estateService = require("../services/estateOffers.service");
const {
  createEstateSchema,
  updateEstateSchema,
  idParamSchema,
  getAllEstatesSchema,
  updateStatusSchema,
} = require("../validations/estateOffersValidation");

// ========== GET ALL ESTATES ==========
exports.getAllEstates = asyncHandler(async (req, res, next) => {
  // التحقق من صحة معاملات البحث
  const { error, value } = getAllEstatesSchema.validate(req.query, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Invalid query parameters",
      errors: error.details.map((err) => err.message),
    });
  }

  // استدعاء الـ Service
  const result = await estateService.getAllEstates(value);

  res.status(200).json({
    status: "success",
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalResults: result.total,
    results: result.estates.length,
    data: result.estates,
  });
});

// ========== GET SINGLE ESTATE ==========
exports.getEstateById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // التحقق من صحة الـ ID
  const { error } = idParamSchema.validate({ id });
  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  // استدعاء الـ Service
  const estate = await estateService.getEstateById(id);

  if (!estate) {
    return res.status(404).json({
      status: "error",
      message: `No estate found for this ID: ${id}`,
    });
  }

  res.status(200).json({
    status: "success",
    data: estate,
  });
});

// ========== CREATE ESTATE ==========
exports.createEstate = asyncHandler(async (req, res, next) => {
  // التحقق من صحة البيانات
  const { error, value } = createEstateSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: error.details.map((err) => err.message),
    });
  }

  // استدعاء الـ Service
  const estate = await estateService.createEstate(value);

  res.status(201).json({
    status: "success",
    message: "Estate created successfully",
    data: estate,
  });
});

// ========== UPDATE ESTATE ==========
exports.updateEstate = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // التحقق من صحة الـ ID
  const { error: idError } = idParamSchema.validate({ id });
  if (idError) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  // التحقق من صحة بيانات التحديث
  const { error, value } = updateEstateSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Validation error",
      errors: error.details.map((err) => err.message),
    });
  }

  // استدعاء الـ Service
  const estate = await estateService.updateEstate(id, value);

  if (!estate) {
    return res.status(404).json({
      status: "error",
      message: `No estate found for this ID: ${id}`,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Estate updated successfully",
    data: estate,
  });
});

// ========== DELETE ESTATE ==========
exports.deleteEstate = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // التحقق من صحة الـ ID
  const { error } = idParamSchema.validate({ id });
  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  // استدعاء الـ Service
  const estate = await estateService.deleteEstate(id);

  if (!estate) {
    return res.status(404).json({
      status: "error",
      message: `No estate found for this ID: ${id}`,
    });
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

  // التحقق من صحة الـ ID
  const { error: idError } = idParamSchema.validate({ id });
  if (idError) {
    return res.status(400).json({
      status: "error",
      message: "Invalid ID format",
    });
  }

  // التحقق من صحة الحالة
  const { error, value } = updateStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message,
    });
  }

  // استدعاء الـ Service
  const estate = await estateService.updateStatus(id, value.status);

  if (!estate) {
    return res.status(404).json({
      status: "error",
      message: `No estate found for this ID: ${id}`,
    });
  }

  res.status(200).json({
    status: "success",
    message: `Estate status updated to ${value.status}`,
    data: estate,
  });
});
