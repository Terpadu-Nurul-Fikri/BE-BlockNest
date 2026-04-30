import Joi from "joi";

export const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(3).max(100).messages({
    "string.empty": "Nama depan tidak boleh kosong",
    "string.min": "Nama depan minimal 3 karakter",
    "string.max": "Nama depan maksimal 100 karakter",
  }),

  lastName: Joi.string().trim().max(100).allow(null, "").messages({
    "string.max": "Nama belakang maksimal 100 karakter",
  }),

  userName: Joi.string().trim().min(3).max(100).messages({
    "string.empty": "Username tidak boleh kosong",
    "string.min": "Username minimal 3 karakter",
    "string.max": "Username maksimal 100 karakter",
  }),

  phone: Joi.string().trim().min(10).max(15).allow(null, "").messages({
    "string.min": "Nomor telepon minimal 10 digit",
    "string.max": "Nomor telepon maksimal 15 digit",
  }),

  email: Joi.string().email().messages({
    "string.email": "Format email tidak valid",
  }),

  password: Joi.string().min(6).messages({
    "string.min": "Password minimal 6 karakter",
  }),

  photoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Format URL foto tidak valid",
  }),
});
