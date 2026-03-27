const { body, query, param, validationResult } = require("express-validator");

// Middleware untuk handle validation errors
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  };
};

// Auth validations
const registerValidation = validate([
  body("email").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phone").optional().isMobilePhone("id-ID").withMessage("Invalid phone number"),
]);

const loginValidation = validate([
  body("email").isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
]);

const changePasswordValidation = validate([
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
]);

// Product validations
const createProductValidation = validate([
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Product slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug must be lowercase with hyphens only"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("sku").trim().notEmpty().withMessage("SKU is required"),
  body("categoryId").isUUID().withMessage("Invalid category ID"),
]);

const updateProductValidation = validate([
  body("name").optional().trim().notEmpty().withMessage("Product name cannot be empty"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
]);

// Order validations
const createOrderValidation = validate([
  body("addressId").isUUID().withMessage("Invalid address ID"),
  body("paymentMethod").isIn(["credit_card", "bank_transfer", "e_wallet", "cod"]).withMessage("Invalid payment method"),
  body("notes").optional().trim(),
]);

const updateOrderStatusValidation = validate([
  body("status")
    .isIn(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
    .withMessage("Invalid order status"),
]);

// Query validations
const paginationValidation = validate([
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
]);

// Param validations
const uuidParamValidation = validate([param("id").isUUID().withMessage("Invalid ID format")]);

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  createProductValidation,
  updateProductValidation,
  createOrderValidation,
  updateOrderStatusValidation,
  paginationValidation,
  uuidParamValidation,
};
