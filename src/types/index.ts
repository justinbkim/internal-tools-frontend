export type UserRole = 'compliance_analyst' | 'compliance_manager' | 'support_agent' | 'support_manager' | 'engineer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface KycCase {
  id: string;
  applicantName: string;
  dob: string;
  taxId: string;
  email: string;
  country: string;
  riskScore: number;
  flagReason?: string;
  status: 'new' | 'in_review' | 'pending_info' | 'approved' | 'rejected' | 'escalated';
  assignedTo?: string;
  decisionReason?: string;
  decidedBy?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  customerName: string;
  originalTxnId: string;
  amountCents: number;
  reasonCode: string;
  status: 'pending' | 'approved' | 'denied' | 'submitted' | 'settled' | 'failed';
  requestedBy: string;
  approvedBy?: string;
  requestedAt: string;
  decidedAt?: string;
}

export interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: 'dev' | 'staging' | 'prod';
  updatedBy: string;
  updatedAt: string;
}

export interface SavedView {
  id: string;
  name: string;
  entityType: 'kyc_cases' | 'refunds';
  filterJson: any;
  visibleColumns: string[];
  sortJson: any;
  ownerRole: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: any;
  afterJson?: any;
  reason?: string;
  createdAt: string;
}
