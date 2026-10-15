export interface FormMockData {
  email: string;
  name: string;
  phone: string;
  defaultText: string;
}

export const MOCK_CONTEXT_DATA: FormMockData = {
  email: 'qa.auditor@qa-sec.local',
  name: 'QA Security Auditor',
  phone: '+1234567890',
  defaultText: 'QA Validation Context Data',
};

export function resolveValueForInputType(typeAttr: string, nameAttr: string): string {
  const normType = (typeAttr || '').toLowerCase();
  const normName = (nameAttr || '').toLowerCase();

  if (normType === 'email' || normName.includes('email')) return MOCK_CONTEXT_DATA.email;
  if (normType === 'tel' || normName.includes('phone') || normName.includes('tel')) return MOCK_CONTEXT_DATA.phone;
  if (normName.includes('name') || normName.includes('user')) return MOCK_CONTEXT_DATA.name;
  return MOCK_CONTEXT_DATA.defaultText;
}