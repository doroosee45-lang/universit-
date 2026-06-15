const ExcelJS = require('exceljs');

/**
 * Exporte la liste des étudiants en Excel
 */
const exportStudentsToExcel = async (students) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Étudiants');

  // Colonnes
  sheet.columns = [
    { header: 'N° Étudiant', key: 'studentId', width: 15 },
    { header: 'Nom', key: 'lastName', width: 20 },
    { header: 'Prénom', key: 'firstName', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Filière', key: 'program', width: 20 },
    { header: 'Niveau', key: 'level', width: 10 },
    { header: 'Semestre', key: 'semester', width: 12 },
    { header: 'Statut', key: 'status', width: 15 },
    { header: 'Date inscription', key: 'enrollmentDate', width: 18 }
  ];

  // Style en-tête
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };
  sheet.getRow(1).alignment = { horizontal: 'center' };

  // Données
  students.forEach(s => {
    sheet.addRow({
      studentId: s.studentId,
      lastName: s.lastName,
      firstName: s.firstName,
      email: s.email,
      program: s.program?.name || '',
      level: s.level,
      semester: s.currentSemester,
      status: s.status,
      enrollmentDate: s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString('fr-FR') : ''
    });
  });

  // Bordures
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  });

  return workbook.xlsx.writeBuffer();
};

/**
 * Exporte les notes d'une UE en Excel
 */
const exportGradesToExcel = async (grades, ueName) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(`Notes - ${ueName}`);

  sheet.columns = [
    { header: 'N° Étudiant', key: 'studentId', width: 15 },
    { header: 'Nom', key: 'lastName', width: 20 },
    { header: 'Prénom', key: 'firstName', width: 20 },
    { header: 'CC (40%)', key: 'cc', width: 12 },
    { header: 'Partiel (20%)', key: 'partiel', width: 14 },
    { header: 'Final (40%)', key: 'final', width: 12 },
    { header: 'Moyenne', key: 'average', width: 12 },
    { header: 'Mention', key: 'mention', width: 15 },
    { header: 'Validé', key: 'validated', width: 10 }
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56DB' } };

  grades.forEach(g => {
    const row = sheet.addRow({
      studentId: g.student?.studentId || '',
      lastName: g.student?.lastName || '',
      firstName: g.student?.firstName || '',
      cc: g.assessments?.find(a => a.type === 'controle_continu')?.score || '-',
      partiel: g.assessments?.find(a => a.type === 'examen_partiel')?.score || '-',
      final: g.assessments?.find(a => a.type === 'examen_final')?.score || '-',
      average: g.average,
      mention: g.mention || '',
      validated: g.isValidated ? 'Oui' : 'Non'
    });

    // Colorer en rouge les notes < 10
    if (g.average < 10) {
      row.getCell('average').font = { color: { argb: 'FFCC0000' }, bold: true };
    }
  });

  return workbook.xlsx.writeBuffer();
};

/**
 * Import d'étudiants depuis Excel (retourne les données parsées)
 */
const importStudentsFromExcel = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet(1);
  const students = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip en-tête
    const [, lastName, firstName, email, phone, dateOfBirth, level] = row.values;
    if (email) {
      students.push({ lastName, firstName, email, phone, dateOfBirth, level });
    }
  });

  return students;
};

module.exports = { exportStudentsToExcel, exportGradesToExcel, importStudentsFromExcel };