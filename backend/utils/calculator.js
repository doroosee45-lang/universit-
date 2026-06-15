const { MENTIONS, PASSING_GRADE } = require('../config/constants');

/**
 * Calcule la moyenne pondérée d'un étudiant pour une UE
 * @param {Array} assessments - [{ score, maxScore, weight }]
 * @returns {number} moyenne sur 20
 */
const calculateUEAverage = (assessments) => {
  if (!assessments || assessments.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  assessments.forEach(({ score, maxScore, weight }) => {
    const normalizedScore = (score / maxScore) * 20;
    totalWeightedScore += normalizedScore * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) / 100 : 0;
};

/**
 * Calcule la moyenne semestrielle (pondérée par coefficients des UEs)
 * @param {Array} ueGrades - [{ average, coefficient }]
 * @returns {number}
 */
const calculateSemesterAverage = (ueGrades) => {
  if (!ueGrades || ueGrades.length === 0) return 0;

  let totalWeighted = 0;
  let totalCoeff = 0;

  ueGrades.forEach(({ average, coefficient }) => {
    totalWeighted += average * coefficient;
    totalCoeff += coefficient;
  });

  return totalCoeff > 0 ? Math.round((totalWeighted / totalCoeff) * 100) / 100 : 0;
};

/**
 * Calcule la moyenne annuelle
 * @param {Array} semesterAverages - [{ average, ects }]
 */
const calculateYearAverage = (semesterAverages) => {
  if (!semesterAverages || semesterAverages.length === 0) return 0;

  const total = semesterAverages.reduce((sum, s) => sum + s.average, 0);
  return Math.round((total / semesterAverages.length) * 100) / 100;
};

/**
 * Détermine la mention selon la note
 */
const getMention = (average) => {
  for (const [key, mention] of Object.entries(MENTIONS)) {
    if (average >= mention.min && average <= mention.max) {
      return mention.label;
    }
  }
  return 'Ajourné';
};

/**
 * Vérifie si une UE est validée
 */
const isUEValidated = (average) => average >= PASSING_GRADE;

/**
 * Calcule les ECTS obtenus
 * @param {Array} ueResults - [{ average, ects }]
 */
const calculateECTS = (ueResults) => {
  return ueResults.reduce((total, ue) => {
    return total + (isUEValidated(ue.average) ? ue.ects : 0);
  }, 0);
};

/**
 * Calcule le rang dans une liste de notes
 */
const calculateRank = (studentAverage, allAverages) => {
  const sorted = [...allAverages].sort((a, b) => b - a);
  return sorted.indexOf(studentAverage) + 1;
};

module.exports = {
  calculateUEAverage,
  calculateSemesterAverage,
  calculateYearAverage,
  getMention,
  isUEValidated,
  calculateECTS,
  calculateRank
};