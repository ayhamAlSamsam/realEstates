// controllers/requestController.js
const asyncHandler = require("express-async-handler");
const requestService = require("../services/estateRequest.service");
const {
  createRequestSchema,
  updateRequestSchema,
  idParamSchema,
  getAllRequestsSchema,
  updateRequestStatusSchema,
} = require("../validations/estateRequestValidation");

// ========== GET ALL REQUESTS ==========
exports.getAllRequests = asyncHandler(async (req, res, next) => {
  const { error, value } = getAllRequestsSchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      status: "error",
      message: "Invalid query parameters",
      errors: error.details.map((err) => err.message),
    });
  }

  const result = await requestService.getAllRequests(value);

  res.status(200).json({
    status: "success",
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    totalResults: result.total,
    results: result.requests.length,
    data: result.requests,
  });
});

// ========== GET SINGLE REQUEST ==========
exports.getRequestById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { error } = idParamSchema.validate({ id });
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  const request = await requestService.getRequestById(id);

  if (!request) {
    return res.status(404).json({
      status: "error",
      message: `No request found for this ID: ${id}`,
    });
  }

  res.status(200).json({ status: "success", data: request });
});

// ========== CREATE REQUEST ==========
exports.createRequest = asyncHandler(async (req, res, next) => {
  // const { error, value } = createRequestSchema.validate(req.body, {
  //   abortEarly: false,
  // });
  // if (error) {
  //   return res.status(400).json({
  //     status: "error",
  //     message: "Validation error",
  //     errors: error.details.map((err) => err.message),
  //   });
  // }
  let estateData = req.body;
  const request = await requestService.createRequest(estateData);

  res.status(201).json({
    status: "success",
    message: "Request created successfully",
    data: request,
  });
});

// ========== UPDATE REQUEST ==========
exports.updateRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { error: idError } = idParamSchema.validate({ id });
  if (idError) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  // const { error, value } = updateRequestSchema.validate(req.body, {
  //   abortEarly: false,
  // });
  // if (error) {
  //   return res.status(400).json({
  //     status: "error",
  //     message: "Validation error",
  //     errors: error.details.map((err) => err.message),
  //   });
  // }
  let estateData = req.body;

  const request = await requestService.updateRequest(id, estateData);

  if (!request) {
    return res.status(404).json({
      status: "error",
      message: `No request found for this ID: ${id}`,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Request updated successfully",
    data: request,
  });
});

// ========== DELETE REQUEST ==========
exports.deleteRequest = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { error } = idParamSchema.validate({ id });
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  const request = await requestService.deleteRequest(id);

  if (!request) {
    return res.status(404).json({
      status: "error",
      message: `No request found for this ID: ${id}`,
    });
  }

  res.status(200).json({
    status: "success",
    message: "Request deleted successfully",
    data: request,
  });
});

// ========== UPDATE REQUEST STATUS ==========
exports.updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const { error: idError } = idParamSchema.validate({ id });
  if (idError) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  const { error, value } = updateRequestStatusSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  }

  const request = await requestService.updateStatus(id, value.status);

  if (!request) {
    return res.status(404).json({
      status: "error",
      message: `No request found for this ID: ${id}`,
    });
  }

  res.status(200).json({
    status: "success",
    message: `Request status updated to ${value.status}`,
    data: request,
  });
});

// ========== MATCH REQUEST WITH OFFERS ==========
exports.matchRequestWithOffers = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // التحقق من صحة الـ ID
  const { error } = idParamSchema.validate({ id });
  if (error) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid ID format" });
  }

  try {
    const result = await requestService.matchOffersForRequest(id);

    if (result === null) {
      return res.status(404).json({
        status: "error",
        message: `No request found for this ID: ${id}`,
      });
    }

    res.status(200).json({
      status: "success",
      message: `Found ${result.totalMatches} matching offer(s)`,
      data: {
        request: result.request,
        totalMatches: result.totalMatches,
        offers: result.matchedOffers,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
});
