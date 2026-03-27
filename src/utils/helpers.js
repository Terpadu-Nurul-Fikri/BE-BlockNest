// Format price to IDR
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// Calculate percentage
const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

// Generate slug from string
const generateSlug = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Pagination helper
const getPagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  return { skip, take, page: pageNum, limit: limitNum };
};

// Format pagination response
const formatPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

// Calculate order totals
const calculateOrderTotals = (items, taxRate = 0.11, shippingCost = 0) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const tax = subtotal * taxRate;
  const total = subtotal + tax + shippingCost;

  return {
    subtotal,
    tax,
    shippingCost,
    total,
  };
};

// Format date to Indonesian format
const formatDate = (date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Sanitize user data (remove password)
const sanitizeUser = (user) => {
  const { password, ...sanitized } = user;
  return sanitized;
};

// Generate random code (for order number, etc)
const generateCode = (prefix = "", length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = prefix;

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
};

module.exports = {
  formatPrice,
  calculatePercentage,
  generateSlug,
  getPagination,
  formatPaginatedResponse,
  calculateOrderTotals,
  formatDate,
  sanitizeUser,
  generateCode,
};
