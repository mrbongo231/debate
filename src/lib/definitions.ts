export type EvidenceCard = {
  claim: string;
  quote: string;
  explanation: string;
};

export type Citation = {
  author?: string;
  title?: string;
  publication?: string;
  date?: string;
  url?: string;
};

export type ResearchEvidenceCard = EvidenceCard & {
  citation: Citation;
};
