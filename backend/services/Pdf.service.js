const PDFDocument = require('pdfkit');
const { getMention } = require('../utils/calculator');
const { formatDate } = require('../utils/helpers');

/**
 * Génère un relevé de notes PDF
 */
const generateTranscriptPDF = (transcriptData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buf => buffers.push(buf));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { student, program, ueGrades, semesterAverage, semester, academicYear, rank, totalStudents } = transcriptData;

    // En-tête
    doc.fontSize(16).font('Helvetica-Bold').text("RELEVÉ DE NOTES OFFICIEL", { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(transcriptData.schoolName || 'Université', { align: 'center' });
    doc.moveDown();

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Infos étudiant
    doc.fontSize(11).font('Helvetica-Bold').text('Informations étudiant');
    doc.font('Helvetica');
    doc.text(`Nom : ${student.lastName.toUpperCase()}   Prénom : ${student.firstName}`);
    doc.text(`N° Étudiant : ${student.studentId || '-'}   INE : ${student.ine || '-'}`);
    doc.text(`Filière : ${program.name}   Semestre : ${semester}   Année : ${academicYear}`);
    doc.moveDown();

    // Tableau des notes
    doc.font('Helvetica-Bold').fontSize(11).text('Détail des notes');
    doc.moveDown(0.5);

    // En-têtes colonnes
    const colX = { ue: 50, title: 90, coeff: 330, credits: 380, avg: 430, mention: 470 };
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text('Code', colX.ue, doc.y);
    doc.text('Intitulé UE', colX.title, doc.y - 12);
    doc.text('Coef', colX.coeff, doc.y - 12);
    doc.text('ECTS', colX.credits, doc.y - 12);
    doc.text('Note/20', colX.avg, doc.y - 12);
    doc.text('Mention', colX.mention, doc.y - 12);
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);

    // Lignes notes
    doc.font('Helvetica').fontSize(9);
    ueGrades.forEach((ue) => {
      const y = doc.y;
      const validated = ue.average >= 10;
      if (!validated) doc.fillColor('red');
      doc.text(ue.ueCode || '-', colX.ue, y, { width: 35 });
      doc.text(ue.ueTitle, colX.title, y, { width: 235 });
      doc.text(String(ue.coefficient), colX.coeff, y);
      doc.text(String(ue.credits), colX.credits, y);
      doc.text(ue.average.toFixed(2), colX.avg, y);
      doc.text(ue.mention || getMention(ue.average), colX.mention, y);
      doc.fillColor('black');
      doc.moveDown(0.7);
    });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Résumé
    doc.font('Helvetica-Bold').fontSize(11);
    doc.text(`Moyenne semestrielle : ${semesterAverage.toFixed(2)}/20   Mention : ${getMention(semesterAverage)}`);
    if (rank) doc.text(`Rang : ${rank} / ${totalStudents}`);
    doc.text(`ECTS obtenus : ${transcriptData.totalECTS || 0}`);

    doc.moveDown(2);

    // Signatures
    doc.fontSize(10).font('Helvetica');
    doc.text('Le Doyen / Directeur', 50, doc.y, { width: 200 });
    doc.text('Cachet et Signature', 350, doc.y - 12, { width: 200 });

    doc.moveDown(2);
    doc.fontSize(8).fillColor('gray')
      .text(`Document généré le ${formatDate(new Date())} - Vérifiable via QR Code`, { align: 'center' });

    doc.end();
  });
};

/**
 * Génère un reçu de paiement PDF
 */
const generateReceiptPDF = (paymentData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', buf => buffers.push(buf));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const { student, payment, fee, receiptNumber } = paymentData;

    doc.fontSize(18).font('Helvetica-Bold').text('REÇU DE PAIEMENT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').text(`N° ${receiptNumber}`, { align: 'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Étudiant :');
    doc.font('Helvetica').text(`${student.firstName} ${student.lastName} - N° ${student.studentId}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Détails du paiement :');
    doc.font('Helvetica');
    doc.text(`Montant payé : ${payment.amount} DA`);
    doc.text(`Mode de paiement : ${payment.method}`);
    doc.text(`Date : ${formatDate(payment.paymentDate)}`);
    doc.text(`Année universitaire : ${fee.academicYear}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').text(`Montant total : ${fee.totalAmount} DA`);
    doc.text(`Montant restant : ${fee.remainingAmount} DA`);
    doc.moveDown(2);
    doc.font('Helvetica').fontSize(9).fillColor('gray')
      .text('Ce reçu est valable comme preuve de paiement.', { align: 'center' });

    doc.end();
  });
};

module.exports = { generateTranscriptPDF, generateReceiptPDF };