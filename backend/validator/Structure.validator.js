const Joi = require('joi');

// Program
exports.createProgramSchema = Joi.object({
  name: Joi.string().min(3).required(),
  code: Joi.string().uppercase().min(2).max(10).required(),
  department: Joi.string().required(),
  level: Joi.string().valid('licence', 'master', 'doctorat', 'bts', 'dut').required(),
  duration: Joi.number().valid(1, 2, 3, 4, 5).required(),
  coordinator: Joi.string().hex().length(24).optional(),
  description: Joi.string().max(1000).optional(),
  maxStudents: Joi.number().positive().optional(),
});

// UE
exports.createUESchema = Joi.object({
  name: Joi.string().min(3).required(),
  code: Joi.string().uppercase().required(),
  program: Joi.string().hex().length(24).required(),
  semester: Joi.number().min(1).max(10).required(),
  credits: Joi.number().min(1).max(30).required(),
  coefficient: Joi.number().positive().default(1),
  type: Joi.string().valid('fundamental', 'complementary', 'optional').required(),
});

// Course
exports.createCourseSchema = Joi.object({
  name: Joi.string().min(3).required(),
  code: Joi.string().uppercase().required(),
  ue: Joi.string().hex().length(24).required(),
  teacher: Joi.string().hex().length(24).optional(),
  type: Joi.string().valid('course', 'td', 'tp', 'project').required(),
  hoursPerWeek: Joi.number().positive().required(),
  totalHours: Joi.number().positive().optional(),
});

// Schedule
exports.createScheduleSchema = Joi.object({
  course: Joi.string().hex().length(24).required(),
  teacher: Joi.string().hex().length(24).required(),
  room: Joi.string().hex().length(24).required(),
  program: Joi.string().hex().length(24).required(),
  dayOfWeek: Joi.number().min(0).max(6).required(), // 0=Lundi...5=Samedi
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  semester: Joi.number().valid(1, 2).required(),
  academicYear: Joi.string().required(),
  week: Joi.string().valid('A', 'B', 'all').default('all'),
});