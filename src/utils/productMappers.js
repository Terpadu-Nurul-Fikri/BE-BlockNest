const toPriceNumber = (value) => {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const calculateAverageRating = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
  return total / reviews.length;
};

const normalizeRating = (product) => {
  if (typeof product.averageRating === "number") {
    return product.averageRating;
  }

  if (typeof product.averageRating === "string") {
    const parsed = parseFloat(product.averageRating);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return calculateAverageRating(product.reviews || []);
};

const mapProductToCard = (product) => {
  const primaryImage = (product.images || []).find((image) => image.isPrimary) || (product.images || [])[0] || null;
  const rating = normalizeRating(product);
  const reviewCount = typeof product.reviewCount === "number" ? product.reviewCount : (product.reviews || []).length;

  return {
    id: product.id,
    name: product.name,
    price: toPriceNumber(product.price),
    category: product.subCategory || product.category?.name || "General",
    description: product.description,
    imageUrl: primaryImage?.url || "",
    imageAlt: primaryImage?.alt || product.name,
    rating: Number(rating.toFixed(1)),
    reviewCount,
    isNew: Boolean(product.isNew),
    slug: product.slug,
  };
};

module.exports = {
  mapProductToCard,
};
