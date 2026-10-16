export type CveSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export interface CveItem {
  id: string;
  publishedAt: string;
  updatedAt: string;
  description: string;
  severity: CveSeverity;
  cvssScore: number;
  referenceUrl?: string;
}

export interface CveFeedResponse {
  success: boolean;
  totalResults: number;
  vulnerabilities: CveItem[];
  fetchedAt: string;
}

export interface CveFilterDTO {
  keyword?: string;
  severity?: CveSeverity;
  limit?: number;
  startDate?: string; // Formato YYYY-MM-DD (Opcional)
  endDate?: string;   // Formato YYYY-MM-DD (Opcional)
}