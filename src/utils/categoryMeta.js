const CATEGORY_META = {
  "living-room": {
    label: "Living Room",
    headline: "Living Room Furniture",
    description: "Create a space that invites you to slow down. Sofas, armchairs, coffee tables, and shelving for daily living.",
    seoDescription: "Shop Scandinavian living room furniture: sofas, armchairs, coffee tables, and shelving.",
    heroImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1400&q=85&fit=crop",
    heroAlt: "Bright Scandinavian living room with sofa and oak coffee table",
    ogImage: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80&fit=crop",
  },
  bedroom: {
    label: "Bedroom",
    headline: "Bedroom Furniture",
    description: "Low-profile beds, minimal wardrobes, and bedside tables designed to calm, not clutter.",
    seoDescription: "Discover bedroom furniture with a clean Scandinavian style.",
    heroImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&q=85&fit=crop",
    heroAlt: "Minimalist bedroom with low bed frame and natural light",
    ogImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80&fit=crop",
  },
  dining: {
    label: "Dining",
    headline: "Dining Furniture",
    description: "Tables and chairs made for long meals and longer conversations.",
    seoDescription: "Shop dining tables and chairs in solid wood finishes.",
    heroImage: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1400&q=85&fit=crop",
    heroAlt: "Scandinavian dining room with oak table and soft pendant light",
    ogImage: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1200&q=80&fit=crop",
  },
  office: {
    label: "Office",
    headline: "Home Office Furniture",
    description: "Desks, chairs, and storage built for focus, comfort, and style.",
    seoDescription: "Home office furniture that blends productivity and minimalist design.",
    heroImage: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=85&fit=crop",
    heroAlt: "Clean home office with wooden desk and ergonomic chair",
    ogImage: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80&fit=crop",
  },
  outdoor: {
    label: "Outdoor",
    headline: "Outdoor Furniture",
    description: "Weather-ready teak and steel furniture for garden, terrace, and balcony.",
    seoDescription: "Discover durable outdoor furniture with timeless Scandinavian design.",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85&fit=crop",
    heroAlt: "Sunny outdoor terrace with dining table and chairs",
    ogImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80&fit=crop",
  },
  sale: {
    label: "Sale",
    headline: "Sale - Up to 40% Off",
    description: "End-of-season pieces at reduced prices with the same premium materials.",
    seoDescription: "Furniture sale on selected Scandinavian pieces with limited stock.",
    heroImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=85&fit=crop",
    heroAlt: "Minimalist living room showing selected sale pieces",
    ogImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&fit=crop",
  },
};

const toTitleCase = (value = "") =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getCategoryMeta = (slug, category = null) => {
  if (CATEGORY_META[slug]) {
    return {
      slug,
      ...CATEGORY_META[slug],
    };
  }

  const label = category?.name || toTitleCase(slug) || "Collection";

  return {
    slug,
    label,
    headline: `${label} Furniture`,
    description: category?.description || `Explore our ${label.toLowerCase()} collection.`,
    seoDescription: category?.description || `Shop ${label.toLowerCase()} furniture collection.`,
    heroImage: category?.image || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=85&fit=crop",
    heroAlt: `${label} furniture collection`,
    ogImage: category?.image || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&fit=crop",
  };
};

module.exports = {
  CATEGORY_META,
  getCategoryMeta,
};
