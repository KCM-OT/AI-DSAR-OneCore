// Mock tenant data for the Meridian Brands demo, taken from the v0 prototype
// (docs/v0-reference.md). Everything here is fictional.

export const SIGNED_IN_USER = {
  name: 'Amara Reyes',
  firstName: 'Amara',
  initials: 'AR',
  role: 'Privacy Program Manager',
};

export const TENANT = 'Meridian Brands';

export interface ProfileRow {
  label: string;
  values: string[];
}

// What the Privacy Agent "researched" about the company (setup step 1).
export const COMPANY_PROFILE: readonly ProfileRow[] = [
  { label: 'Brands', values: ['Northwind Outfitters', 'Cascade Home', 'Alpine Rewards'] },
  {
    label: 'Privacy regulations in scope',
    values: ['CCPA/CPRA (California)', 'VCDPA (Virginia)', 'CPA (Colorado)', 'GDPR (Germany)'],
  },
  { label: 'Customer countries', values: ['United States', 'Germany', 'Austria'] },
  { label: 'Employees', values: ['United States', 'Germany'] },
];

export interface UploadedDoc {
  name: string;
  kind: 'pdf' | 'docx';
}

export const SETUP_DOCUMENTS: readonly UploadedDoc[] = [
  { name: 'DSAR Standard Operating Procedure.pdf', kind: 'pdf' },
  { name: 'Customer Data Flows.pdf', kind: 'pdf' },
  { name: 'Response Letter Examples.docx', kind: 'docx' },
  { name: 'Meridian Brand + Tone Guide.pdf', kind: 'pdf' },
];

export interface PlaybookItem {
  text: string;
  source: string;
}

export interface PlaybookSection {
  title: string;
  items: PlaybookItem[];
}

// The operating playbook the agent decomposes from the uploaded documents.
export const PLAYBOOK: readonly PlaybookSection[] = [
  {
    title: 'Process rules',
    items: [
      {
        text: 'Access packages containing support transcripts: redact third-party personal information; privacy sign-off required before disclosure',
        source: 'SOP §4.2',
      },
      { text: 'Identity verification required before any data handling', source: 'SOP §2.1' },
      { text: 'Deletion holds: accounts with open disputes route to Legal', source: 'SOP §5.3' },
    ],
  },
  {
    title: 'Data landscape',
    items: [
      { text: 'Customer records: Salesforce', source: 'Customer Data Flows' },
      { text: 'Marketing profiles: Marketo', source: 'Customer Data Flows' },
      { text: 'Support tickets + transcripts: Zendesk', source: 'Customer Data Flows' },
      {
        text: 'Transactions + Alpine Rewards balances: internal warehouse (owner: Daniel Okafor)',
        source: 'Customer Data Flows',
      },
    ],
  },
  {
    title: 'Voice & brand',
    items: [
      { text: 'Plain, warm, direct; short sentences; no legalese in body text', source: 'Brand + Tone Guide' },
      { text: "Loyalty program is always 'Alpine Rewards'", source: 'Brand + Tone Guide' },
      { text: 'Response letters follow the Meridian letter structure', source: 'Response Letter Examples' },
    ],
  },
];

export interface IntakeAgent {
  brand: string;
  requestTypes: string[];
  regulations: string[];
}

const REQUEST_TYPES = ['Access', 'Deletion', 'Correction', 'Opt-Out'];

export const INTAKE_AGENTS: readonly IntakeAgent[] = [
  { brand: 'Northwind Outfitters', requestTypes: REQUEST_TYPES, regulations: ['CCPA/CPRA', 'VCDPA', 'CPA', 'GDPR'] },
  { brand: 'Cascade Home', requestTypes: REQUEST_TYPES, regulations: ['CCPA/CPRA', 'VCDPA', 'CPA', 'GDPR'] },
  { brand: 'Alpine Rewards', requestTypes: REQUEST_TYPES, regulations: ['CCPA/CPRA', 'VCDPA', 'CPA', 'GDPR'] },
  { brand: 'Meridian Employees', requestTypes: REQUEST_TYPES, regulations: ['CCPA/CPRA', 'GDPR'] },
];

export interface ConnectedSystem {
  name: string;
  holds: string;
  // How the agent works in the system: a native connector, or a person it asks.
  method: string;
  connector: boolean;
}

// The v0 capture cuts off after "…and your internal warehouse"; the methods
// below are inferred from the rest of the demo (Act 3 asks Daniel in Teams and
// tracks it in ServiceNow).
export const SYSTEMS: readonly ConnectedSystem[] = [
  { name: 'Salesforce', holds: 'Customer records', method: 'OneTrust connector', connector: true },
  { name: 'Marketo', holds: 'Marketing profiles', method: 'OneTrust connector', connector: true },
  { name: 'Zendesk', holds: 'Support tickets + transcripts', method: 'OneTrust connector', connector: true },
  {
    name: 'Internal warehouse',
    holds: 'Transactions + Alpine Rewards balances',
    method: 'No connector: I ask the owner, Daniel Okafor, in Microsoft Teams and track it in ServiceNow',
    connector: false,
  },
];

export const SETUP_STEPS = [
  'Research & identification',
  'Document upload',
  'Operational playbook',
  'Suggested agents',
  'Integrations',
] as const;
