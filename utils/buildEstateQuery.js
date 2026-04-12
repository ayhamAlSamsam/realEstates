// utils/buildEstateQuery.js

const buildEstateQuery = (f) => {
  let query = {};
console.log("build",f);

  // 🔍 unified search (code + title فقط)
  if (f.keyword) {
    query.$or = [
      { code: { $regex: f.keyword, $options: "i" } },
      // { title: { $regex: f.keyword, $options: "i" } },
    ];
  }

  // 🏷️ basic
  if (f.processType) query.processType = f.processType;
  if (f.estateType) query.estateType = f.estateType;

  if (f.city) {
    query.city = { $regex: f.city, $options: "i" };
  }

  if (f.neighborhood) {
    query.neighborhood = { $regex: f.neighborhood, $options: "i" };
  }

  // 🛏️
  if (f.bedrooms) {
    query.bedrooms = { $gte: Number(f.bedrooms) };
  }

  if (f.bathrooms) {
    query.bathrooms = { $gte: Number(f.bathrooms) };
  }

  // 💰 price
  if (f.minPrice || f.maxPrice) {
    query.price = {};
    if (f.minPrice) query.price.$gte = Number(f.minPrice);
    if (f.maxPrice) query.price.$lte = Number(f.maxPrice);
  }

  // 📐 space
  if (f.minSpace || f.maxSpace) {
    query.totalSpace = {};
    if (f.minSpace) query.totalSpace.$gte = Number(f.minSpace);
    if (f.maxSpace) query.totalSpace.$lte = Number(f.maxSpace);
  }

  // ⭐ flags
  if (f.isFeatured === true) query.isFeatured = true;
  if (f.isUrgent === true) query.isUrgent = true;

  return query;
};

module.exports = buildEstateQuery;