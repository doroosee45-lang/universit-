require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Teacher = require('../models/Teacher.model');
const Program = require('../models/Program.model');
const UE = require('../models/UE.model');
const Course = require('../models/Course.model');
const Room = require('../models/Room.model');
const Fee = require('../models/Fee.model');
const Grade = require('../models/Grade.model');
const Attendance = require('../models/Attendance.model');
const LibraryBook = require('../models/LibraryBook.model');
const Settings = require('../models/Settings.model');

const logger = require('../utils/logger');

const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/university_db';

const seed = async () => {
  try {
    await mongoose.connect(DB_URL);
    logger.info('✅ Connecté à MongoDB');

    // Nettoyage
    await Promise.all([
      User.deleteMany(),
      Student.deleteMany(),
      Teacher.deleteMany(),
      Program.deleteMany(),
      UE.deleteMany(),
      Course.deleteMany(),
      Room.deleteMany(),
      Fee.deleteMany(),
      Grade.deleteMany(),
      Attendance.deleteMany(),
      LibraryBook.deleteMany(),
      Settings.deleteMany(),
    ]);
    logger.info('🧹 Base de données nettoyée');

    // ─── SETTINGS ────────────────────────────────────────
    await Settings.create({
      universityName: "Université des Sciences et Technologies",
      currentAcademicYear: "2024-2025",
      currentSemester: 2,
      gradingSystem: "20",
      passingGrade: 10,
      timezone: "Africa/Algiers",
      language: "fr",
    });

    // ─── USERS ───────────────────────────────────────────
    const hashedPass = await bcrypt.hash('password123', 12);

    const adminUser = await User.create({
      firstName: 'osee', lastName: 'dorodoro',
      email: 'oseedoro@gmail.com', password: Meya13122000,
      role: 'admin', isActive: true, isVerified: true,
    });

    const staffUser = await User.create({
      firstName: 'Fatima', lastName: 'Zahra',
      email: 'staff@universite.dz', password: hashedPass,
      role: 'staff', isActive: true, isVerified: true,
    });

    const teacherUsers = await User.insertMany([
      { firstName: 'osee', lastName: 'meya', email: 'meya@gmail.com', password: 123456, role: 'teacher', isActive: true, isVerified: true },
      { firstName: 'meya', lastName: 'doro', email: 'doro@gmail.com', password: hashedPass, role: 'teacher', isActive: true, isVerified: true },
      { firstName: 'Karim', lastName: 'Amrani', email: 'amrani@universite.dz', password: hashedPass, role: 'teacher', isActive: true, isVerified: true },
    ]);

    const studentUsers = await User.insertMany([
      { firstName: 'Youcef', lastName: 'Hadjadj', email: 'hadjadj@etudiant.dz', password: hashedPass, role: 'student', isActive: true, isVerified: true },
      { firstName: 'Amina', lastName: 'Belkacem', email: 'belkacem@etudiant.dz', password: hashedPass, role: 'student', isActive: true, isVerified: true },
      { firstName: 'Riad', lastName: 'Meziane', email: 'meziane@etudiant.dz', password: hashedPass, role: 'student', isActive: true, isVerified: true },
      { firstName: 'Sara', lastName: 'Chikhi', email: 'chikhi@etudiant.dz', password: hashedPass, role: 'student', isActive: true, isVerified: true },
      { firstName: 'Amine', lastName: 'Rahmani', email: 'rahmani@etudiant.dz', password: hashedPass, role: 'student', isActive: true, isVerified: true },
    ]);

    logger.info('👤 Utilisateurs créés');

    // ─── PROGRAMS ────────────────────────────────────────
    const programs = await Program.insertMany([
      { name: 'Informatique', code: 'INFO', department: 'Sciences et Technologies', level: 'licence', duration: 3, coordinator: teacherUsers[0]._id, maxStudents: 60 },
      { name: 'Génie Civil', code: 'GC', department: 'Génie', level: 'master', duration: 2, coordinator: teacherUsers[1]._id, maxStudents: 40 },
      { name: 'Économie et Gestion', code: 'ECO', department: 'Sciences Économiques', level: 'licence', duration: 3, coordinator: teacherUsers[2]._id, maxStudents: 80 },
    ]);

    // ─── TEACHERS ────────────────────────────────────────
    const teachers = await Teacher.insertMany([
      { user: teacherUsers[0]._id, matricule: 'ENS-2024-001', specialty: 'Informatique', grade: 'maitre_assistant', department: 'Sciences et Technologies', contractType: 'permanent' },
      { user: teacherUsers[1]._id, matricule: 'ENS-2024-002', specialty: 'Génie Civil', grade: 'professeur', department: 'Génie', contractType: 'permanent' },
      { user: teacherUsers[2]._id, matricule: 'ENS-2024-003', specialty: 'Économie', grade: 'maitre_conference', department: 'Sciences Économiques', contractType: 'permanent' },
    ]);

    // ─── UEs ─────────────────────────────────────────────
    const ues = await UE.insertMany([
      { name: 'Algorithmique', code: 'INFO-UE1', program: programs[0]._id, semester: 1, credits: 6, coefficient: 2, type: 'fundamental' },
      { name: 'Base de données', code: 'INFO-UE2', program: programs[0]._id, semester: 2, credits: 6, coefficient: 2, type: 'fundamental' },
      { name: 'Résistance des matériaux', code: 'GC-UE1', program: programs[1]._id, semester: 1, credits: 5, coefficient: 2, type: 'fundamental' },
      { name: 'Microéconomie', code: 'ECO-UE1', program: programs[2]._id, semester: 1, credits: 4, coefficient: 1.5, type: 'fundamental' },
    ]);

    // ─── COURSES ─────────────────────────────────────────
    const courses = await Course.insertMany([
      { name: 'Algorithmique Avancée', code: 'INFO101', ue: ues[0]._id, teacher: teachers[0]._id, type: 'course', hoursPerWeek: 3, totalHours: 45 },
      { name: 'TD Algorithmique', code: 'INFO101-TD', ue: ues[0]._id, teacher: teachers[0]._id, type: 'td', hoursPerWeek: 1.5, totalHours: 22 },
      { name: 'Bases de Données', code: 'INFO201', ue: ues[1]._id, teacher: teachers[0]._id, type: 'course', hoursPerWeek: 3, totalHours: 45 },
      { name: 'Microéconomie', code: 'ECO101', ue: ues[3]._id, teacher: teachers[2]._id, type: 'course', hoursPerWeek: 3, totalHours: 45 },
    ]);

    // ─── ROOMS ───────────────────────────────────────────
    await Room.insertMany([
      { name: 'Amphi A', building: 'Bâtiment Principal', capacity: 200, type: 'amphitheater', floor: 0 },
      { name: 'Salle 101', building: 'Bâtiment A', capacity: 40, type: 'classroom', floor: 1 },
      { name: 'Labo Info 1', building: 'Bâtiment B', capacity: 30, type: 'laboratory', floor: 1 },
      { name: 'Salle TD 201', building: 'Bâtiment A', capacity: 25, type: 'classroom', floor: 2 },
    ]);

    // ─── STUDENTS ────────────────────────────────────────
    const students = await Student.insertMany([
      { user: studentUsers[0]._id, matricule: 'ETU-2024-001', program: programs[0]._id, level: 1, academicYear: '2024-2025', dateOfBirth: new Date('2002-05-15'), gender: 'male', status: 'active' },
      { user: studentUsers[1]._id, matricule: 'ETU-2024-002', program: programs[0]._id, level: 1, academicYear: '2024-2025', dateOfBirth: new Date('2003-02-20'), gender: 'female', status: 'active' },
      { user: studentUsers[2]._id, matricule: 'ETU-2024-003', program: programs[0]._id, level: 2, academicYear: '2024-2025', dateOfBirth: new Date('2001-11-08'), gender: 'male', status: 'active' },
      { user: studentUsers[3]._id, matricule: 'ETU-2024-004', program: programs[2]._id, level: 1, academicYear: '2024-2025', dateOfBirth: new Date('2003-07-14'), gender: 'female', status: 'active' },
      { user: studentUsers[4]._id, matricule: 'ETU-2024-005', program: programs[2]._id, level: 2, academicYear: '2024-2025', dateOfBirth: new Date('2002-09-30'), gender: 'male', status: 'active' },
    ]);

    logger.info('🎓 Étudiants créés');

    // ─── GRADES ──────────────────────────────────────────
    await Grade.insertMany([
      { student: students[0]._id, course: courses[0]._id, score: 14.5, type: 'exam', semester: 1, academicYear: '2024-2025', published: true },
      { student: students[0]._id, course: courses[2]._id, score: 16, type: 'exam', semester: 2, academicYear: '2024-2025', published: true },
      { student: students[1]._id, course: courses[0]._id, score: 12, type: 'exam', semester: 1, academicYear: '2024-2025', published: true },
      { student: students[1]._id, course: courses[2]._id, score: 18, type: 'exam', semester: 2, academicYear: '2024-2025', published: true },
      { student: students[2]._id, course: courses[0]._id, score: 9.5, type: 'exam', semester: 1, academicYear: '2024-2025', published: true },
      { student: students[3]._id, course: courses[3]._id, score: 15, type: 'exam', semester: 1, academicYear: '2024-2025', published: true },
      { student: students[4]._id, course: courses[3]._id, score: 11.5, type: 'exam', semester: 1, academicYear: '2024-2025', published: true },
    ]);

    // ─── ATTENDANCE ──────────────────────────────────────
    const today = new Date();
    const attendanceRecords = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      attendanceRecords.push(
        { student: students[0]._id, course: courses[0]._id, date, status: 'present' },
        { student: students[1]._id, course: courses[0]._id, date, status: i === 2 ? 'absent' : 'present' },
        { student: students[2]._id, course: courses[0]._id, date, status: i >= 3 ? 'absent' : 'present' },
      );
    }
    await Attendance.insertMany(attendanceRecords);

    // ─── FEES ────────────────────────────────────────────
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + 1);
    await Fee.insertMany([
      { student: students[0]._id, type: 'tuition', amount: 15000, paidAmount: 15000, status: 'paid', dueDate, academicYear: '2024-2025' },
      { student: students[1]._id, type: 'tuition', amount: 15000, paidAmount: 0, status: 'pending', dueDate, academicYear: '2024-2025' },
      { student: students[2]._id, type: 'tuition', amount: 15000, paidAmount: 7500, status: 'partial', dueDate, academicYear: '2024-2025' },
      { student: students[3]._id, type: 'tuition', amount: 12000, paidAmount: 12000, status: 'paid', dueDate, academicYear: '2024-2025' },
      { student: students[4]._id, type: 'tuition', amount: 12000, paidAmount: 0, status: 'overdue', dueDate: new Date('2024-01-01'), academicYear: '2024-2025' },
    ]);

    // ─── LIBRARY ─────────────────────────────────────────
    await LibraryBook.insertMany([
      { title: 'Introduction à l\'Algorithmique', author: 'Cormen, Leiserson', isbn: '978-2-100-05422-0', category: 'Informatique', totalCopies: 5, availableCopies: 3, publisher: 'Dunod', year: 2022 },
      { title: 'Bases de Données Relationnelles', author: 'C.J. Date', isbn: '978-0-321-19784-4', category: 'Informatique', totalCopies: 3, availableCopies: 2, publisher: 'Addison-Wesley', year: 2020 },
      { title: 'Microéconomie', author: 'Hal Varian', isbn: '978-2-100-78634-1', category: 'Économie', totalCopies: 8, availableCopies: 5, publisher: 'De Boeck', year: 2021 },
      { title: 'Résistance des Matériaux', author: 'Beer & Johnston', isbn: '978-2-807-32234-9', category: 'Génie Civil', totalCopies: 4, availableCopies: 4, publisher: 'McGraw-Hill', year: 2019 },
    ]);

    logger.info('📚 Bibliothèque remplie');

    logger.info('\n========== SEED TERMINÉ ==========');
    logger.info('Comptes créés :');
    logger.info('  👨‍💼 Admin     : admin@universite.dz / password123');
    logger.info('  👩‍💼 Staff     : staff@universite.dz / password123');
    logger.info('  👨‍🏫 Enseignant: khelifi@universite.dz / password123');
    logger.info('  🎓 Étudiant  : hadjadj@etudiant.dz / password123');
    logger.info('==================================\n');

    process.exit(0);
  } catch (err) {
    logger.error(`❌ Erreur seeder : ${err.message}`);
    console.error(err);
    process.exit(1);
  }
};

seed();