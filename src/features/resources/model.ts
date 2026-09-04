export type ApplicantType = 'school' | 'media' | 'other';
export type ResourceLocale = 'en' | 'zh';

export interface ResourceSchool {
  id: string;
  name: Record<ResourceLocale, string>;
  emailDomain: string;
}

export interface ResourcePackage {
  id: number;
  name: Record<ResourceLocale, string>;
  description: Record<ResourceLocale, string>;
  fileName: string;
  contentType: string;
  fileSize: number;
  sortOrder: number;
}

export interface ResourceApplicationDraft {
  applicantType: ApplicantType;
  schoolId: string;
  organization: string;
  emailPrefix: string;
  workEmail: string;
  fullName: string;
  position: string;
  phone: string;
  purposeDescription: string;
  resourceIds: number[];
  agreed: boolean;
}

export type ApplicationError =
  | 'required'
  | 'school'
  | 'email'
  | 'emailPrefix'
  | 'schoolDomain'
  | 'schoolEmailUnavailable'
  | 'workEmail'
  | 'phone'
  | 'resources'
  | 'agreement';
export type ApplicationErrors = Partial<Record<keyof ResourceApplicationDraft, ApplicationError>>;

export function createApplicationDraft(): ResourceApplicationDraft {
  return {
    applicantType: 'school',
    schoolId: '',
    organization: '',
    emailPrefix: '',
    workEmail: '',
    fullName: '',
    position: '',
    phone: '',
    purposeDescription: '',
    resourceIds: [],
    agreed: false,
  };
}

// Client-side validation; the final domain policy must also be enforced by the API.
const personalEmailDomains = new Set([
  'gmail.com', 'googlemail.com', 'qq.com', 'foxmail.com', '163.com', '126.com',
  'yeah.net', 'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'yahoo.com',
  'yahoo.com.cn', 'yahoo.co.uk', 'yahoo.co.jp', 'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'sina.com', 'sina.cn', 'sohu.com', 'proton.me', 'protonmail.com',
]);

const emailPrefixPattern = /^[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i;
const emailPattern = /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

/** Accept a pasted full school email only when its domain matches the selected school. */
export function normalizeSchoolEmail(value: string, domain?: string): string {
  const email = value.trim();
  const at = email.lastIndexOf('@');
  if (domain && at > 0 && email.slice(at + 1).toLowerCase() === domain.toLowerCase()) {
    return email.slice(0, at);
  }
  return value;
}

export function validateApplication(
  draft: ResourceApplicationDraft,
  schools: ResourceSchool[],
  resources: ResourcePackage[],
): ApplicationErrors {
  const errors: ApplicationErrors = {};
  if (draft.applicantType === 'school') {
    const school = schools.find(item => item.id === draft.schoolId);
    if (!school) {
      errors.schoolId = 'school';
    } else if (!school.emailDomain) {
      errors.schoolId = 'schoolEmailUnavailable';
    } else {
      const prefix = draft.emailPrefix.trim();
      if (!prefix) errors.emailPrefix = 'required';
      else if (prefix.includes('@')) errors.emailPrefix = 'schoolDomain';
      else if (!emailPrefixPattern.test(prefix) || prefix.length > 64) errors.emailPrefix = 'emailPrefix';
    }
  } else {
    if (!draft.organization.trim()) errors.organization = 'required';
    const email = draft.workEmail.trim();
    if (!email) errors.workEmail = 'required';
    else if (!emailPattern.test(email) || !emailPrefixPattern.test(email.split('@')[0])) errors.workEmail = 'email';
    else if (personalEmailDomains.has(email.split('@')[1].toLowerCase())) errors.workEmail = 'workEmail';
    if (!draft.purposeDescription.trim()) errors.purposeDescription = 'required';
  }
  if (!draft.fullName.trim()) errors.fullName = 'required';
  if (!draft.position.trim()) errors.position = 'required';
  const digits = draft.phone.replace(/\D/g, '');
  if (!draft.phone.trim()) errors.phone = 'required';
  else if (!/^\+?[\d\s()-]+$/.test(draft.phone.trim()) || digits.length < 7 || digits.length > 15) errors.phone = 'phone';
  if (!draft.resourceIds.length || draft.resourceIds.some(id => !resources.some(item => item.id === id))) {
    errors.resourceIds = 'resources';
  }
  if (!draft.agreed) errors.agreed = 'agreement';
  return errors;
}

export function mapMaterialResource(material: API.MaterialResource): ResourcePackage {
  return {
    id: material.id,
    name: {
      en: material.nameEn || material.nameZh || material.fileName,
      zh: material.nameZh || material.nameEn || material.fileName,
    },
    description: {
      en: material.descriptionEn || material.descriptionZh || '',
      zh: material.descriptionZh || material.descriptionEn || '',
    },
    fileName: material.fileName,
    contentType: material.contentType,
    fileSize: material.fileSize,
    sortOrder: material.sortOrder,
  };
}

export function getTimestampMilliseconds(value: number): number {
  return value < 1_000_000_000_000 ? value * 1000 : value;
}

export function formatAccessDate(value: number, locale: ResourceLocale): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: locale === 'zh' ? 'numeric' : 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: locale === 'en',
  }).format(new Date(getTimestampMilliseconds(value)));
}

export function formatFileSize(value: number, locale: ResourceLocale): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(Math.floor(Math.log(value) / Math.log(1000)), units.length - 1);
  const size = value / (1000 ** unitIndex);
  return `${new Intl.NumberFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    maximumFractionDigits: unitIndex === 0 ? 0 : 2,
  }).format(size)} ${units[unitIndex]}`;
}
