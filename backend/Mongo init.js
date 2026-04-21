// Script d'initialisation MongoDB
// Exécuté au premier démarrage du conteneur

db = db.getSiblingDB('university_db');

// Créer un utilisateur dédié pour l'application
db.createUser({
  user: 'university_app',
  pwd: 'apppassword2024',
  roles: [
    { role: 'readWrite', db: 'university_db' },
    { role: 'dbAdmin', db: 'university_db' },
  ],
});

// Créer les collections avec validation de base
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: { bsonType: 'string', description: 'Email obligatoire' },
        role: { enum: ['admin', 'staff', 'teacher', 'student'] },
      },
    },
  },
});

// Index pour les performances
db.users.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ matricule: 1 }, { unique: true, sparse: true });
db.students.createIndex({ program: 1, level: 1, academicYear: 1 });
db.teachers.createIndex({ matricule: 1 }, { unique: true, sparse: true });
db.grades.createIndex({ student: 1, course: 1, academicYear: 1 });
db.attendance.createIndex({ student: 1, course: 1, date: 1 });
db.fees.createIndex({ student: 1, status: 1, dueDate: 1 });
db.libraryloans.createIndex({ borrower: 1, status: 1 });
db.schedules.createIndex({ program: 1, dayOfWeek: 1, semester: 1 });
db.notifications.createIndex({ recipient: 1, read: 1, createdAt: -1 });

print('✅ MongoDB initialisé avec succès');