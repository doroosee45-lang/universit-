const QRCode = require('qrcode');

/**
 * Génère un QR Code en base64 (pour les relevés, diplômes)
 */
const generateQRCode = async (data) => {
  return await QRCode.toDataURL(JSON.stringify(data), {
    width: 200,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  });
};

/**
 * Génère un QR Code pour vérification de document
 */
const generateDocumentQR = async (documentType, documentId, studentId) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${documentType}/${documentId}`;
  return await QRCode.toDataURL(verificationUrl, { width: 150 });
};

/**
 * Génère un QR Code pour la prise de présence rapide en amphi
 */
const generateAttendanceQR = async (courseId, date, teacherId) => {
  const payload = {
    courseId,
    date: date.toISOString(),
    teacherId,
    expires: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
  };
  return await QRCode.toDataURL(JSON.stringify(payload), { width: 300 });
};

module.exports = { generateQRCode, generateDocumentQR, generateAttendanceQR };