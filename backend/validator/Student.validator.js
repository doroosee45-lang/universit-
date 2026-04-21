const Joi = require('joi');

exports.createStudentSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid('male', 'female').required(),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
  }).optional(),
  program: Joi.string().hex().length(24).required(),
  level: Joi.number().valid(1, 2, 3, 4, 5).required(),
  academicYear: Joi.string().required(),
  nationalId: Joi.string().optional(),
  guardianName: Joi.string().optional(),
  guardianPhone: Joi.string().optional(),
  guardianEmail: Joi.string().email().optional(),
});

exports.updateStudentSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    country: Joi.string().optional(),
  }).optional(),
  guardianName: Joi.string().optional(),
  guardianPhone: Joi.string().optional(),
  guardianEmail: Joi.string().email().optional(),
});