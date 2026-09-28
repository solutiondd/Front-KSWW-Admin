import featureFlags from "../config/featureFlags";
// import { i18n } from "../i18n";

export const PREFIX_OPTIONS_TH = ["เด็กชาย", "เด็กหญิง", "นาย", "นางสาว"];
export const PREFIX_OPTIONS_EN = ["Mr.", "Miss", "Mstr."];

export const TEACHER_PREFIX_OPTIONS_TH = ["นาย", "นาง", "นางสาว"];
export const TEACHER_PREFIX_OPTIONS_EN = ["Mr.", "Miss", "Mrs."];

export const isEnglishPrefixEnabled = () =>
  featureFlags.prefixSystem?.enableEnglishPrefix === true;

// export const isEnglishPrefixEnabled = () => {
//   const currentLocale = i18n.global.locale.value || i18n.global.locale;
//   return currentLocale === "en";
// };

export const getPrefixOptions = () =>
  isEnglishPrefixEnabled() ? PREFIX_OPTIONS_EN : PREFIX_OPTIONS_TH;

export const getTeacherPrefixOptions = () =>
  isEnglishPrefixEnabled() ? TEACHER_PREFIX_OPTIONS_EN : TEACHER_PREFIX_OPTIONS_TH;
