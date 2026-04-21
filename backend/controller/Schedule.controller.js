const Schedule = require('../models/Schedule.model');
const { successResponse, errorResponse } = require('../utils/apiResponse');


exports.getAllSchedules = async (req, res) => {
  try {
    const { program, teacher, room, week, semester } = req.query;
    const filter = {};
    if (program) filter.program = program;
    if (teacher) filter.teacher = teacher;
    if (room) filter.room = room;
    if (week) filter.week = week;
    if (semester) filter.semester = semester;

    const schedules = await Schedule.find(filter)
      .populate('course', 'title code type')
      .populate('teacher', 'firstName lastName')
      .populate('program', 'name code')
      .sort({ dayOfWeek: 1, startTime: 1 });

    return successResponse(res, schedules);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('course teacher room program');
    if (!schedule) return errorResponse(res, 'Emploi du temps introuvable', 404);
    return successResponse(res, schedule);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.createSchedule = async (req, res) => {
  try {
    // VÃ©rifier conflit de salle
    const conflict = await Schedule.findOne({
      room: req.body.room,
      dayOfWeek: req.body.dayOfWeek,
      $or: [
        { startTime: { $lt: req.body.endTime }, endTime: { $gt: req.body.startTime } }
      ]
    });
    if (conflict) return errorResponse(res, 'Conflit de salle dÃ©tectÃ©', 409);

    const schedule = await Schedule.create(req.body);
    return successResponse(res, schedule, 'SÃ©ance crÃ©Ã©e', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!schedule) return errorResponse(res, 'Introuvable', 404);
    return successResponse(res, schedule, 'SÃ©ance mise Ã  jour');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    return successResponse(res, null, 'SÃ©ance supprimÃ©e');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

exports.getTeacherSchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find({ teacher: req.params.teacherId })
      .populate('course', 'name')
      .populate('room', 'name')
      .sort({ dayOfWeek: 1, startTime: 1 });
    return successResponse(res, schedules);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

































// const Schedule = require('../models/Schedule.model');

// // Obtenir toutes les séances (avec filtres optionnels pour admin)
// exports.getAll = async (req, res) => {
//   try {
//     const { program, semester, group, year, day } = req.query;
//     let filter = {};
//     if (program) filter.program = program;
//     if (semester) filter.semester = semester;
//     if (group) filter.group = group;
//     if (year) filter.year = year;
//     if (day !== undefined && day !== '') filter.day = parseInt(day);
    
//     const schedules = await Schedule.find(filter).sort({ day: 1, start: 1 });
//     res.json({ success: true, data: schedules });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Obtenir l'emploi du temps pour un enseignant (basé sur son nom)
// exports.getTeacherSchedule = async (req, res) => {
//   try {
//     const teacherName = req.user.firstName + ' ' + req.user.lastName;
//     const schedules = await Schedule.find({ teacher: teacherName }).sort({ day: 1, start: 1 });
//     res.json({ success: true, data: schedules });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Obtenir l'emploi du temps pour un étudiant (basé sur sa filière, semestre, groupe, année)
// exports.getStudentSchedule = async (req, res) => {
//   try {
//     const student = req.user;
//     const filter = {
//       program: student.program || '',
//       semester: student.currentSemester || '',
//       group: student.group || '',
//       year: student.academicYear || getCurrentAcademicYear()
//     };
//     // Enlever les critères vides
//     Object.keys(filter).forEach(key => !filter[key] && delete filter[key]);
//     const schedules = await Schedule.find(filter).sort({ day: 1, start: 1 });
//     res.json({ success: true, data: schedules });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Créer une séance (admin)
// exports.create = async (req, res) => {
//   try {
//     const schedule = new Schedule({ ...req.body, createdBy: req.user._id });
//     await schedule.save();
//     res.status(201).json({ success: true, data: schedule });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Mettre à jour une séance (admin)
// exports.update = async (req, res) => {
//   try {
//     const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!schedule) return res.status(404).json({ message: 'Séance non trouvée' });
//     res.json({ success: true, data: schedule });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Supprimer une séance (admin)
// exports.delete = async (req, res) => {
//   try {
//     const schedule = await Schedule.findByIdAndDelete(req.params.id);
//     if (!schedule) return res.status(404).json({ message: 'Séance non trouvée' });
//     res.json({ success: true, message: 'Séance supprimée' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// function getCurrentAcademicYear() {
//   const y = new Date().getFullYear();
//   return `${y}-${y+1}`;
// }