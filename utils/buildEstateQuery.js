// utils/buildEstateQuery.js (تأكد من وجوده بهذا الشكل)
const buildEstateQuery = (filters) => {
  const query = {};

  // كلمة البحث
  if (filters.keyword) {
    query.$or = [
      { title: { $regex: filters.keyword, $options: "i" } },
      { description: { $regex: filters.keyword, $options: "i" } },
      { city: { $regex: filters.keyword, $options: "i" } },
      { neighborhood: { $regex: filters.keyword, $options: "i" } },
      { code: { $regex: filters.keyword, $options: "i" } },
    ];
  }

  // نوع العقار
  if (filters.type && filters.type.length > 0) {
    query.estateType = { $in: filters.type };
  }

  // السعر
  if (filters.price) {
    query.price = {};
    if (filters.price.min) query.price.$gte = filters.price.min;
    if (filters.price.max) query.price.$lte = filters.price.max;
  }

  // الغرف
  if (filters.rooms && filters.rooms.length > 0) {
    query.bedrooms = { $in: filters.rooms };
  }

  // الحالة
  if (filters.status && filters.status !== "All") {
    query.status = filters.status;
  }

  // المدينة
  if (filters.city) query.city = filters.city;

  // الحي
  if (filters.neighborhood) query.neighborhood = filters.neighborhood;

  // نوع العملية (بيع/إيجار)
  if (filters.processType) query.processType = filters.processType;

  // مميز
  if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;

  // عاجل
  if (filters.isUrgent !== undefined) query.isUrgent = filters.isUrgent;

  // عدد الحمامات
  if (filters.bathrooms) query.bathrooms = filters.bathrooms;

  // المساحة
  if (filters.minSpace || filters.maxSpace) {
    query.totalSpace = {};
    if (filters.minSpace) query.totalSpace.$gte = filters.minSpace;
    if (filters.maxSpace) query.totalSpace.$lte = filters.maxSpace;
  }

  return query;
};

module.exports = buildEstateQuery;
