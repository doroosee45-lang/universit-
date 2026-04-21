const Joi = require('joi');

// Grade
exports.createGradeSchema = Joi.object({
  student: Joi.string().hex().length(24).required(),
  course: Joi.string().hex().length(24).required(),
  exam: Joi.string().hex().length(24).optional(),
  score: Joi.number().min(0).max(20).required(),
  type: Joi.string().valid('exam', 'assignment', 'quiz', 'practical').required(),
  semester: Joi.number().valid(1, 2).required(),
  academicYear: Joi.string().required(),
  comment: Joi.string().max(500).optional(),
});

exports.bulkGradeSchema = Joi.object({
  grades: Joi.array().items(
    Joi.object({
      student: Joi.string().hex().length(24).required(),
      score: Joi.number().min(0).max(20).required(),
      comment: Joi.string().optional(),
    })
  ).min(1).required(),
  course: Joi.string().hex().length(24).required(),
  exam: Joi.string().hex().length(24).optional(),
  type: Joi.string().valid('exam', 'assignment', 'quiz', 'practical').required(),
  semester: Joi.number().valid(1, 2).required(),
  academicYear: Joi.string().required(),
});

// Attendance
exports.attendanceSchema = Joi.object({
  student: Joi.string().hex().length(24).required(),
  course: Joi.string().hex().length(24).required(),
  date: Joi.date().required(),
  status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
  justification: Joi.string().max(500).optional(),
});

exports.bulkAttendanceSchema = Joi.object({
  records: Joi.array().items(
    Joi.object({
      student: Joi.string().hex().length(24).required(),
      status: Joi.string().valid('present', 'absent', 'late', 'excused').required(),
      justification: Joi.string().optional(),
    })
  ).min(1).required(),
  course: Joi.string().hex().length(24).required(),
  date: Joi.date().required(),
});

// Fee
exports.createFeeSchema = Joi.object({
  student: Joi.string().hex().length(24).required(),
  type: Joi.string().valid('tuition', 'registration', 'library', 'lab', 'exam', 'other').required(),
  amount: Joi.number().positive().required(),
  dueDate: Joi.date().required(),
  academicYear: Joi.string().required(),
  semester: Joi.number().valid(1, 2).optional(),
  description: Joi.string().optional(),
});

exports.paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string().valid('cash', 'bank_transfer', 'cheque', 'online').required(),
  reference: Joi.string().optional(),
  notes: Joi.string().optional(),
});

// Exam
exports.createExamSchema = Joi.object({
  title: Joi.string().required(),
  course: Joi.string().hex().length(24).required(),
  program: Joi.string().hex().length(24).required(),
  type: Joi.string().valid('midterm', 'final', 'quiz', 'practical', 'makeup').required(),
  date: Joi.date().required(),
  startTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  endTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  room: Joi.string().hex().length(24).optional(),
  totalMarks: Joi.number().positive().default(20),
  semester: Joi.number().valid(1, 2).required(),
  academicYear: Joi.string().required(),
});