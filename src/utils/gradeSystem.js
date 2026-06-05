import featureFlags from "../config/featureFlags";

const MAX_SORT = Number.MAX_SAFE_INTEGER;

const normalizeGradeText = (grade) => {
  if (!grade) return "";
  return String(grade).trim().replace(/\s+/g, " ");
};

const isPrep = (grade) => normalizeGradeText(grade) === "เตรียมอนุบาล";
const isKg1 = (grade) => /^อนุบาล\s*1$/u.test(normalizeGradeText(grade));
const isKg2 = (grade) => /^อนุบาล\s*2$/u.test(normalizeGradeText(grade));

const getPrimaryNumber = (grade) => {
  const match = normalizeGradeText(grade).match(/^ป\.\s*(\d{1,2})$/u);
  return match ? Number(match[1]) : null;
};

const getSecondaryNumber = (grade) => {
  const match = normalizeGradeText(grade).match(/^ม\.\s*(\d{1,2})$/u);
  return match ? Number(match[1]) : null;
};

const getYearNumber = (grade) => {
  const match = normalizeGradeText(grade)
    .toUpperCase()
    .match(/^YR\s*(\d{1,2})$/);
  return match ? Number(match[1]) : null;
};

export const getGradeSortOrder = (grade) => {
  if (!grade) return MAX_SORT;

  if (isPrep(grade)) return 1;
  if (isKg1(grade)) return 2;
  if (isKg2(grade)) return 3;

  const year = getYearNumber(grade);
  if (year !== null) return year + 3;

  const primary = getPrimaryNumber(grade);
  if (primary !== null) return primary + 3;

  const secondary = getSecondaryNumber(grade);
  if (secondary !== null) return secondary + 9;

  return MAX_SORT;
};

export const compareGrades = (a, b) => {
  const orderA = getGradeSortOrder(a);
  const orderB = getGradeSortOrder(b);
  if (orderA !== orderB) return orderA - orderB;
  return String(a || "").localeCompare(String(b || ""));
};

export const mapGradeDisplay = (rawGrade) => {
  if (!featureFlags.gradeSystem?.enableDisplayMapping) return rawGrade;

  if (isPrep(rawGrade)) return "NS";
  if (isKg1(rawGrade)) return "KG1";
  if (isKg2(rawGrade)) return "KG2";

  const primary = getPrimaryNumber(rawGrade);
  if (primary !== null) return `YR${primary}`;

  const secondary = getSecondaryNumber(rawGrade);
  if (secondary !== null) return `YR${secondary + 6}`;

  const year = getYearNumber(rawGrade);
  if (year !== null) return `YR${year}`;

  return rawGrade;
};

export const getGradeUiLabel = (rawGrade) => {
  if (featureFlags.gradeSystem?.enableDisplayMapping) {
    return mapGradeDisplay(rawGrade);
  }

  if (!featureFlags.gradeSystem?.enableLowerLevels) {
    const secondary = getSecondaryNumber(rawGrade);
    if (secondary !== null) return `มัธยมศึกษาปีที่ ${secondary}`;
  }

  return rawGrade;
};

export const getGradeUiBadge = (rawGrade) => {
  if (featureFlags.gradeSystem?.enableDisplayMapping) {
    const mapped = mapGradeDisplay(rawGrade);
    const yearMatch = String(mapped).match(/^YR(\d{1,2})$/);
    if (yearMatch) return yearMatch[1];
    return mapped;
  }

  if (!featureFlags.gradeSystem?.enableLowerLevels) {
    const secondary = getSecondaryNumber(rawGrade);
    if (secondary !== null) return String(secondary);
  }

  return rawGrade;
};

export const formatGradeClassroomDisplay = (grade, classroom) => {
  const mappedGrade = mapGradeDisplay(grade);
  if (
    mappedGrade &&
    classroom !== undefined &&
    classroom !== null &&
    String(classroom) !== ""
  ) {
    return `${mappedGrade}/${classroom}`;
  }
  if (mappedGrade) return mappedGrade;
  if (
    classroom !== undefined &&
    classroom !== null &&
    String(classroom) !== ""
  ) {
    return String(classroom);
  }
  return "-";
};

export const shouldIncludeGrade = (grade) => {
  if (featureFlags.gradeSystem?.enableLowerLevels) return true;

  const order = getGradeSortOrder(grade);
  if (order === MAX_SORT) return true;
  return order >= 10;
};

export const getConfiguredGrades = () => {
  const secondary = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];
  if (!featureFlags.gradeSystem?.enableLowerLevels) return secondary;

  return [
    "เตรียมอนุบาล",
    "อนุบาล 1",
    "อนุบาล 2",
    "ป.1",
    "ป.2",
    "ป.3",
    "ป.4",
    "ป.5",
    "ป.6",
    ...secondary,
  ];
};

export const toVisibleSortedGrades = (grades) => {
  return [...new Set(grades || [])]
    .filter(Boolean)
    .filter(shouldIncludeGrade)
    .sort(compareGrades);
};

export const isTerminalSecondaryGrade = (grade) => {
  const secondary = getSecondaryNumber(grade);
  if (secondary !== null) return secondary === 3 || secondary === 6;

  const year = getYearNumber(grade);
  if (year !== null) return year === 9 || year === 12;

  return false;
};
