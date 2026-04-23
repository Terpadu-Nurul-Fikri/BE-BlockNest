import Joi from "joi";

// Validator untuk update user
export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Nama tidak boleh kosong",
    "string.min": "Nama minimal 3 karakter",
    "any.required": "Nama wajib diisi",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid",
    "string.empty": "Email tidak boleh kosong",
    "any.required": "Email wajib diisi",
  }),
});

// Validator untuk param ID
export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    "string.guid": "ID harus berupa UUID yang valid",
    "any.required": "ID wajib diisi",
  }),
});
