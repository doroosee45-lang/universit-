require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('./config/database');

async function main() {
  await connectDB();

  const User         = require('./models/User.model');
  const Student      = require('./models/Student.model');
  const Teacher      = require('./models/Teacher.model');
  const Program      = require('./models/Program.model');
  const UE           = require('./models/Ue.model');
  const Course       = require('./models/Course.model');
  const Room         = require('./models/Room.model');
  const Exam         = require('./models/Exam.model');
  const Notification = require('./models/Notification.model');
  const { generateTeacherId } = require('./utils/helpers');

  console.log('🌱 Démarrage du seeder...\n');

  // ── 1. Supprimer anciens comptes de démo ─────────────────────────────────
  const demoEmails = [
    'admin@uni.dz', 'superadmin@uni.dz', 'prof@uni.dz',
    'etud@uni.dz',  'staff@uni.dz',      'chef@uni.dz',
    'meya@gmail.com', 'mukunzi@gmail.com',
    'sarah.etud@uni.dz', 'idriss.etud@uni.dz',
  ];
  await User.deleteMany({ email: { $in: demoEmails } });
  console.log('🗑️  Anciens comptes de démo supprimés.\n');

  const password = await bcrypt.hash('Pass@123', 12);

  // ── 2. Créer / réutiliser les programmes de démo ─────────────────────────
  const demoPrograms = [
    {
      name: 'Licence Informatique',
      code: 'LMD-INFO',
      type: 'Licence',
      department: 'Sciences & Technologies',
      levels: ['L1', 'L2', 'L3'],
      academicYear: '2025-2026',
      duration: 6,
      description: 'Formation en informatique fondamentale et appliquée.',
    },
    {
      name: 'Master Intelligence Artificielle',
      code: 'MST-IA',
      type: 'Master',
      department: 'Sciences & Technologies',
      levels: ['M1', 'M2'],
      academicYear: '2025-2026',
      duration: 4,
      description: 'Spécialisation en IA, machine learning et data science.',
    },
    {
      name: 'BTS Réseaux & Télécoms',
      code: 'BTS-RT',
      type: 'BTS',
      department: 'Technologie',
      levels: ['BTS1', 'BTS2'],
      academicYear: '2025-2026',
      duration: 4,
      description: 'Formation technique en réseaux informatiques et télécommunications.',
    },
  ];

  const programs = [];
  for (const p of demoPrograms) {
    const prog = await Program.findOneAndUpdate(
      { code: p.code },
      p,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    programs.push(prog);
  }
  console.log(`✅ ${programs.length} programmes créés / vérifiés :\n`);
  programs.forEach(p => console.log(`   [${p.type.padEnd(10)}] ${p.name} (${p.code})`));
  console.log('');

  const infoProgram = programs.find(p => p.code === 'LMD-INFO');
  const iaProgram   = programs.find(p => p.code === 'MST-IA');
  const btsProgram  = programs.find(p => p.code === 'BTS-RT');

  // ── 3. Créer les comptes admin/staff ────────────────────────────────────
  const staffUsers = [
    {
      firstName: 'Osee', lastName: 'Mukunzi',
      email: 'mukunzi@gmail.com', password,
      role: 'super_admin', isActive: true, isEmailVerified: true,
      superAdminLevel: 1, systemAccess: ['all'],
    },
    {
      firstName: 'Ahmed', lastName: 'Benali',
      email: 'admin@uni.dz', password,
      role: 'admin', isActive: true, isEmailVerified: true,
      department: 'Administration', permissions: [],
    },
    {
      firstName: 'Fatima', lastName: 'Zahra',
      email: 'staff@uni.dz', password,
      role: 'staff', isActive: true, isEmailVerified: true,
      position: 'scolarite', department: 'Scolarité',
    },
  ];

  const created = await User.insertMany(staffUsers, { ordered: false });
  console.log(`✅ ${created.length} comptes admin/staff créés :\n`);
  created.forEach(u => console.log(`   [${u.role.padEnd(16)}] ${u.email}`));
  console.log('');

  // ── 4. Créer l'enseignant via Teacher.create() ────────────────────────────
  await User.deleteMany({ email: 'prof@uni.dz' });
  const year = new Date().getFullYear();
  const allTeachers = await Teacher.find({}, 'employeeId').lean();
  const maxSeq = allTeachers.reduce((max, t) => {
    const m = t.employeeId?.match(new RegExp(`^ENS${year}(\\d{4})$`));
    return m ? Math.max(max, parseInt(m[1])) : max;
  }, 0);

  const demoTeacher = new Teacher({
    employeeId:        generateTeacherId(year, maxSeq + 1),
    firstName:         'Karim',
    lastName:          'Meziane',
    email:             'prof@uni.dz',
    password,
    role:              'teacher',
    isActive:          true,
    isEmailVerified:   true,
    mustChangePassword: false,
    department:        'Informatique',
    title:             'Maître de Conférences A',
    contractType:      'permanent',
    specialties:       ['Intelligence Artificielle', 'Algorithmique', 'Réseaux de neurones'],
    office:            'Bât. B - Bureau 214',
    hireDate:          new Date('2018-09-01'),
    bio:               "Enseignant-chercheur en IA et algorithmique, docteur de l'Université d'Alger.",
    phone:             '+213 551 234 567',
  });
  demoTeacher.$locals.skipHash = true;
  await demoTeacher.save();
  console.log(`✅ Enseignant créé :\n   [teacher         ] ${demoTeacher.email}  →  ID: ${demoTeacher.employeeId}\n`);

  // ── 5. Créer les étudiants ────────────────────────────────────────────────
  const demoStudents = [
    {
      firstName: 'Youcef', lastName: 'Amrani',
      email: 'etud@uni.dz', password,
      role: 'student', isActive: true, isEmailVerified: true, mustChangePassword: false,
      program: infoProgram._id, level: 'L1', currentSemester: 'S2',
      academicYear: '2025-2026', enrollmentDate: new Date('2025-09-15'),
      status: 'active', dateOfBirth: new Date('2003-05-20'),
      placeOfBirth: 'Alger', nationality: 'Algérienne',
      phone: '+213 555 123 456',
      address: { street: '12 rue Didouche Mourad', city: 'Alger', wilaya: 'Alger', postalCode: '16000' },
      guardian: { name: 'Mohammed Amrani', relation: 'Père', phone: '+213 555 789 012' },
    },
    {
      firstName: 'Sarah', lastName: 'Boudiaf',
      email: 'sarah.etud@uni.dz', password,
      role: 'student', isActive: true, isEmailVerified: true, mustChangePassword: false,
      program: infoProgram._id, level: 'L2', currentSemester: 'S3',
      academicYear: '2025-2026', enrollmentDate: new Date('2024-09-10'),
      status: 'active', dateOfBirth: new Date('2002-11-14'),
      placeOfBirth: 'Oran', nationality: 'Algérienne',
      phone: '+213 556 234 567',
      address: { street: '45 avenue Oran', city: 'Oran', wilaya: 'Oran', postalCode: '31000' },
      guardian: { name: 'Nadia Boudiaf', relation: 'Mère', phone: '+213 556 890 123' },
    },
    {
      firstName: 'Idriss', lastName: 'Touré',
      email: 'idriss.etud@uni.dz', password,
      role: 'student', isActive: true, isEmailVerified: true, mustChangePassword: false,
      program: iaProgram._id, level: 'M1', currentSemester: 'S7',
      academicYear: '2025-2026', enrollmentDate: new Date('2025-09-05'),
      status: 'active', dateOfBirth: new Date('2001-03-08'),
      placeOfBirth: 'Constantine', nationality: 'Algérienne',
      phone: '+213 557 345 678',
      address: { city: 'Constantine', wilaya: 'Constantine' },
      guardian: { name: 'Hamid Touré', relation: 'Père', phone: '+213 557 901 234' },
    },
  ];

  const studentEmails = demoStudents.map(s => s.email);
  await User.deleteMany({ email: { $in: studentEmails } });

  const createdStudents = [];
  for (const sd of demoStudents) {
    try {
      const s = new Student(sd);
      s.$locals.skipHash = true;
      await s.save();
      createdStudents.push(s);
    } catch (e) {
      console.error(`   ⚠️  Erreur étudiant ${sd.email}: ${e.message}`);
    }
  }
  console.log(`✅ ${createdStudents.length} étudiants créés :\n`);
  createdStudents.forEach(s =>
    console.log(`   [student] ${s.email}  →  Matricule: ${s.studentId}  |  ${s.level} · ${s.academicYear}`)
  );
  console.log('');

  // ── 6. Créer / réutiliser les UEs ────────────────────────────────────────
  const demoUEs = [
    {
      code:    'ALGO201',
      title:   'Algorithmique et Structures de Données',
      credits: 6, coefficient: 3, semester: 'S2',
      program: infoProgram._id,
      responsibleTeacher: demoTeacher._id,
      description: 'Conception et analyse des algorithmes fondamentaux.',
      volumeHours: { cm: 21, td: 21, tp: 15 },
    },
    {
      code:    'POO201',
      title:   'Programmation Orientée Objet',
      credits: 5, coefficient: 2, semester: 'S2',
      program: infoProgram._id,
      responsibleTeacher: demoTeacher._id,
      description: 'Paradigme objet, Java/Python, design patterns.',
      volumeHours: { cm: 18, td: 18, tp: 21 },
    },
    {
      code:    'RESEAU301',
      title:   'Réseaux Informatiques',
      credits: 6, coefficient: 3, semester: 'S3',
      program: infoProgram._id,
      responsibleTeacher: demoTeacher._id,
      description: 'TCP/IP, routage, protocoles réseau.',
      volumeHours: { cm: 21, td: 21, tp: 15 },
    },
    {
      code:    'IA701',
      title:   'Intelligence Artificielle',
      credits: 6, coefficient: 3, semester: 'S7',
      program: iaProgram._id,
      responsibleTeacher: demoTeacher._id,
      description: 'Machine learning, deep learning, traitement du langage.',
      volumeHours: { cm: 24, td: 18, tp: 18 },
    },
    {
      code:    'ML701',
      title:   'Machine Learning Avancé',
      credits: 5, coefficient: 2, semester: 'S7',
      program: iaProgram._id,
      responsibleTeacher: demoTeacher._id,
      description: 'Algorithmes supervisés et non-supervisés, évaluation de modèles.',
      volumeHours: { cm: 18, td: 21, tp: 21 },
    },
  ];

  const ues = [];
  for (const u of demoUEs) {
    const ue = await UE.findOneAndUpdate(
      { code: u.code },
      u,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    ues.push(ue);
  }
  console.log(`✅ ${ues.length} UEs créées / vérifiées :\n`);
  ues.forEach(u => console.log(`   [${u.code.padEnd(12)}] ${u.title}`));
  console.log('');

  const algoUE   = ues.find(u => u.code === 'ALGO201');
  const pooUE    = ues.find(u => u.code === 'POO201');
  const reseauUE = ues.find(u => u.code === 'RESEAU301');
  const iaUE     = ues.find(u => u.code === 'IA701');
  const mlUE     = ues.find(u => u.code === 'ML701');

  // ── 7. Créer / réutiliser les Cours ──────────────────────────────────────
  const demoCourses = [
    {
      title: 'Algorithmique – CM', code: 'ALGO201-CM', type: 'CM',
      ue: algoUE._id, teacher: demoTeacher._id,
      program: infoProgram._id, semester: 'S2', academicYear: '2025-2026', totalHours: 21,
    },
    {
      title: 'Algorithmique – TD', code: 'ALGO201-TD', type: 'TD',
      ue: algoUE._id, teacher: demoTeacher._id,
      program: infoProgram._id, semester: 'S2', academicYear: '2025-2026', totalHours: 21,
    },
    {
      title: 'POO – CM', code: 'POO201-CM', type: 'CM',
      ue: pooUE._id, teacher: demoTeacher._id,
      program: infoProgram._id, semester: 'S2', academicYear: '2025-2026', totalHours: 18,
    },
    {
      title: 'Réseaux – CM', code: 'RESEAU301-CM', type: 'CM',
      ue: reseauUE._id, teacher: demoTeacher._id,
      program: infoProgram._id, semester: 'S3', academicYear: '2025-2026', totalHours: 21,
    },
    {
      title: 'Intelligence Artificielle – CM', code: 'IA701-CM', type: 'CM',
      ue: iaUE._id, teacher: demoTeacher._id,
      program: iaProgram._id, semester: 'S7', academicYear: '2025-2026', totalHours: 24,
    },
    {
      title: 'Machine Learning – CM', code: 'ML701-CM', type: 'CM',
      ue: mlUE._id, teacher: demoTeacher._id,
      program: iaProgram._id, semester: 'S7', academicYear: '2025-2026', totalHours: 18,
    },
  ];

  const courses = [];
  for (const c of demoCourses) {
    const course = await Course.findOneAndUpdate(
      { code: c.code },
      c,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    courses.push(course);
  }

  // Mettre à jour le teacher avec ses cours
  await Teacher.findByIdAndUpdate(demoTeacher._id, {
    courses: courses.map(c => c._id),
  });

  console.log(`✅ ${courses.length} cours créés / vérifiés :\n`);
  courses.forEach(c => console.log(`   [${c.type}] ${c.code}  –  ${c.title}`));
  console.log('');

  // ── 8. Créer / réutiliser les Salles ─────────────────────────────────────
  const demoRooms = [
    { name: 'Amphithéâtre A', code: 'AMPHI-A', building: 'Bâtiment A', type: 'amphi',    capacity: 300, equipment: { hasProjector: true, hasAC: true, hasWhiteboard: true } },
    { name: 'Amphithéâtre B', code: 'AMPHI-B', building: 'Bâtiment B', type: 'amphi',    capacity: 200, equipment: { hasProjector: true, hasAC: true, hasWhiteboard: true } },
    { name: 'Salle B12',      code: 'SALLE-B12', building: 'Bâtiment B', type: 'salle_td', capacity: 40,  equipment: { hasProjector: true, hasWhiteboard: true } },
    { name: 'Salle C08',      code: 'SALLE-C08', building: 'Bâtiment C', type: 'salle_td', capacity: 35,  equipment: { hasProjector: true, hasWhiteboard: true } },
    { name: 'Salle C10',      code: 'SALLE-C10', building: 'Bâtiment C', type: 'salle_td', capacity: 35,  equipment: { hasProjector: true, hasWhiteboard: true } },
    { name: 'Salle A04',      code: 'SALLE-A04', building: 'Bâtiment A', type: 'salle_td', capacity: 40,  equipment: { hasWhiteboard: true } },
  ];

  const rooms = [];
  for (const r of demoRooms) {
    const room = await Room.findOneAndUpdate(
      { code: r.code },
      r,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    rooms.push(room);
  }
  console.log(`✅ ${rooms.length} salles créées / vérifiées :\n`);
  rooms.forEach(r => console.log(`   [${r.code.padEnd(12)}] ${r.name}  (capacité : ${r.capacity})`));
  console.log('');

  const amphi_a  = rooms.find(r => r.code === 'AMPHI-A');
  const amphi_b  = rooms.find(r => r.code === 'AMPHI-B');
  const salle_b12 = rooms.find(r => r.code === 'SALLE-B12');
  const salle_c08 = rooms.find(r => r.code === 'SALLE-C08');
  const salle_c10 = rooms.find(r => r.code === 'SALLE-C10');
  const salle_a04 = rooms.find(r => r.code === 'SALLE-A04');

  // ── 9. Créer les examens publiés ──────────────────────────────────────────
  // Supprimer les examens de démo existants pour éviter les doublons
  await Exam.deleteMany({ academicYear: '2025-2026' });

  const demoExams = [
    // ── Licence Informatique – L1 (S2) ────────────────────────────────────
    {
      title:       'Examen final – Algorithmique et Structures de Données',
      ue:          algoUE._id,
      program:     infoProgram._id,
      promotion:   'L1',
      session:     'session1',
      type:        'final',
      academicYear:'2025-2026',
      startDate:   new Date('2026-06-18T08:00:00'),
      endDate:     new Date('2026-06-18T10:00:00'),
      duration:    120,
      room:        amphi_a._id,
      maxScore:    20,
      supervisors: [demoTeacher._id],
      instructions:'Documents non autorisés. Calculatrice interdite. Répondre en français ou en arabe.',
      isPublished: true,
      status:      'planned',
    },
    {
      title:       'Examen final – Programmation Orientée Objet',
      ue:          pooUE._id,
      program:     infoProgram._id,
      promotion:   'L1',
      session:     'session1',
      type:        'final',
      academicYear:'2025-2026',
      startDate:   new Date('2026-06-20T14:00:00'),
      endDate:     new Date('2026-06-20T16:30:00'),
      duration:    150,
      room:        salle_b12._id,
      maxScore:    20,
      supervisors: [demoTeacher._id],
      instructions:'Uniquement feuilles de brouillon fournies. Téléphones interdits.',
      isPublished: true,
      status:      'planned',
    },
    // ── Licence Informatique – L2 (S3) ────────────────────────────────────
    {
      title:       'Examen final – Réseaux Informatiques',
      ue:          reseauUE._id,
      program:     infoProgram._id,
      promotion:   'L2',
      session:     'session1',
      type:        'final',
      academicYear:'2025-2026',
      startDate:   new Date('2026-06-22T09:00:00'),
      endDate:     new Date('2026-06-22T11:00:00'),
      duration:    120,
      room:        amphi_b._id,
      maxScore:    20,
      supervisors: [demoTeacher._id],
      instructions:'Autorisé : cours de réseaux (1 feuille recto-verso manuscrite).',
      isPublished: true,
      status:      'planned',
    },
    // ── Master IA – M1 (S7) ───────────────────────────────────────────────
    {
      title:       'Examen final – Intelligence Artificielle',
      ue:          iaUE._id,
      program:     iaProgram._id,
      promotion:   'M1',
      session:     'session1',
      type:        'final',
      academicYear:'2025-2026',
      startDate:   new Date('2026-06-19T08:30:00'),
      endDate:     new Date('2026-06-19T11:00:00'),
      duration:    150,
      room:        salle_c08._id,
      maxScore:    20,
      supervisors: [demoTeacher._id],
      instructions:'Documents autorisés : cours IA + TD. Pas de ressources numériques.',
      isPublished: true,
      status:      'planned',
    },
    {
      title:       'Examen final – Machine Learning Avancé',
      ue:          mlUE._id,
      program:     iaProgram._id,
      promotion:   'M1',
      session:     'session1',
      type:        'final',
      academicYear:'2025-2026',
      startDate:   new Date('2026-06-24T14:00:00'),
      endDate:     new Date('2026-06-24T16:30:00'),
      duration:    150,
      room:        salle_c10._id,
      maxScore:    20,
      supervisors: [demoTeacher._id],
      instructions:"Calculatrices autorisées. Feuille de formules fournie par l'examinateur.",
      isPublished: true,
      status:      'planned',
    },
    // ── Partiel passé (pour tester l'historique) ──────────────────────────
    {
      title:       'Examen partiel – Algorithmique',
      ue:          algoUE._id,
      program:     infoProgram._id,
      promotion:   'L1',
      session:     'mi_session',
      type:        'partiel',
      academicYear:'2025-2026',
      startDate:   new Date('2026-04-10T09:00:00'),
      endDate:     new Date('2026-04-10T10:30:00'),
      duration:    90,
      room:        salle_a04._id,
      maxScore:    20,
      supervisors: [demoTeacher._id],
      isPublished: true,
      status:      'completed',
    },
  ];

  const createdExams = await Exam.insertMany(demoExams);
  console.log(`✅ ${createdExams.length} examens créés et publiés :\n`);
  createdExams.forEach(e =>
    console.log(`   [${e.type.padEnd(8)}] ${e.title.substring(0, 55)}  |  ${e.promotion || '—'}  |  ${new Date(e.startDate).toLocaleDateString('fr-FR')}`)
  );
  console.log('');

  // ── 9. Créer les notifications ────────────────────────────────────────────
  // Supprimer les anciennes notifications de démo liées aux examens
  await Notification.deleteMany({ title: { $in: ["Horaire d'examens publié", 'Programme de surveillance publié'] } });

  // Adminstrateur (sender)
  const adminUser = await User.findOne({ role: 'admin' });
  const senderId  = adminUser?._id || created[0]?._id;

  const examsInfo = createdExams.filter(e =>
    e.program.toString() === infoProgram._id.toString() && e.isPublished
  );
  const examsIA = createdExams.filter(e =>
    e.program.toString() === iaProgram._id.toString() && e.isPublished
  );

  const notifications = [
    // ── Étudiants Licence Informatique ──
    {
      sender:           senderId,
      recipientRole:    'student',
      recipientProgram: infoProgram._id,
      type:             'info',
      title:            "Horaire d'examens publié",
      message:          `L'horaire des examens de session1 (2025-2026) est disponible pour la Licence Informatique. ${examsInfo.length} examen(s) planifié(s). Connectez-vous pour consulter votre calendrier.`,
      link:             '/student/exams',
      isBroadcast:      true,
      isRead:           false,
    },
    // ── Étudiants Master IA ──
    {
      sender:           senderId,
      recipientRole:    'student',
      recipientProgram: iaProgram._id,
      type:             'info',
      title:            "Horaire d'examens publié",
      message:          `L'horaire des examens de session1 (2025-2026) est disponible pour le Master IA. ${examsIA.length} examen(s) planifié(s). Connectez-vous pour consulter votre calendrier.`,
      link:             '/student/exams',
      isBroadcast:      true,
      isRead:           false,
    },
    // ── Enseignant (Karim) ──
    {
      sender:    senderId,
      recipient: demoTeacher._id,
      type:      'info',
      title:     'Programme de surveillance publié',
      message:   `Votre programme de surveillance pour session1 (2025-2026) est disponible. Vous avez ${createdExams.filter(e => e.isPublished && e.status !== 'completed').length} examen(s) à surveiller.`,
      link:      '/teacher/exams',
      isRead:    false,
    },
  ];

  await Notification.insertMany(notifications);
  console.log(`✅ ${notifications.length} notifications créées :\n`);
  console.log(`   → Étudiants Licence Informatique (broadcast programme)\n`);
  console.log(`   → Étudiants Master IA (broadcast programme)\n`);
  console.log(`   → Enseignant Karim Meziane (individuelle)\n`);

  console.log('─'.repeat(60));
  console.log('🔑 Mot de passe pour tous : Pass@123\n');
  console.log('👤 Comptes de démo :');
  console.log('   mukunzi@gmail.com   → super_admin');
  console.log('   admin@uni.dz        → admin');
  console.log('   staff@uni.dz        → staff');
  console.log('   prof@uni.dz         → teacher  (Karim Meziane)');
  console.log('   etud@uni.dz         → student  (Youcef Amrani – L1 Info)');
  console.log('   sarah.etud@uni.dz   → student  (Sarah Boudiaf  – L2 Info)');
  console.log('   idriss.etud@uni.dz  → student  (Idriss Touré   – M1 IA)');
  console.log('─'.repeat(60));
  console.log(`\n📅 Examens planifiés (session1 2025-2026) :`);
  createdExams
    .filter(e => e.status === 'planned')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .forEach(e => {
      const d = new Date(e.startDate).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
      const h = new Date(e.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      console.log(`   ${d} ${h}  →  ${e.title.substring(0, 45)}`);
    });
  console.log('');

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur seeder :', err.message);
  process.exit(1);
});
