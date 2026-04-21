
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum View {
  LANDING = 'landing',
  DASHBOARD = 'dashboard',
  HISTORY = 'history',
  SETTINGS = 'settings',
  RESULT = 'result',
  PRIVACY = 'privacy',
  TERMS = 'terms',
  DOCUMENTATION = 'documentation'
}

export interface SecurityHeader {
  name: string;
  present: boolean;
  value?: string;
}

export interface SSLInfo {
  status: 'Secure' | 'Vulnerable' | 'Unknown';
  // issuer may be a display string or a parsed issuer object from the scanner
  issuer: string | { commonName?: string; organizationName?: string; countryName?: string };
  expiryDate: string;
  daysRemaining: number;
}

export interface DomainInfo {
  ipAddress: string;
  hostingServer: string;
  domainAge: string;
  domainAgeYears: number;
  expiryDate: string;
}

export interface PortStatus {
  port: number;
  service: string;
  status: 'Open' | 'Closed' | 'Filtered';
}

export interface ThreatAlert {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Info';
  title: string;
  description: string;
  source: string;
  remediation?: string;
}

export interface ScanResult {
  url: string;
  timestamp: string;
  score: number;
  riskLevel: RiskLevel;
  ssl: SSLInfo;
  headers: SecurityHeader[];
  domain: DomainInfo;
  ports: PortStatus[];
  threatIntel: ThreatAlert[];
  rawBackend?: any;
  subdomains?: Array<{
    subdomain: string;
    ips: string[];
    is_likely_dev: boolean;
    is_likely_admin: boolean;
  }>;
  lookalikes?: Array<{
    domain: string;
    ips: string[];
    risk_level: 'High' | 'Medium';
  }>;
}

export interface HistoryItem {
  id: string;
  url: string;
  score: number;
  date: string;
  riskLevel: RiskLevel;
  domainAgeYears: number;
  subdomainCount: number;
}
