import Joi from "joi";

export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).invalid("").messages({
    "string.empty": "Nama tidak boleh kosong",
    "string.min": "Nama minimal 3 karakter",
    "any.invalid": "Nama tidak boleh kosong",
  }),

  email: Joi.string().email().messages({
    "string.email": "Format email tidak valid",
  }),
});
