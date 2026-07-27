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
  applicant_name: string;
  dob: string;
  tax_id: string;
  email: string;
  country: string;
  risk_score: number;
  flag_reason?: string;
  status: 'new' | 'in_review' | 'pending_info' | 'approved' | 'rejected' | 'escalated';
  assigned_to?: string;
  decision_reason?: string;
  decided_by?: string;
  decided_at?: string;
  created_at: string;
}

export interface Refund {
  id: string;
  customer_name: string;
  original_txn_id: string;
  amount_cents: number;
  reason_code: string;
  status: 'pending' | 'approved' | 'denied' | 'submitted' | 'settled' | 'failed';
  requested_by: string;
  approved_by?: string;
  requested_at: string;
  decided_at?: string;
}

export interface FeatureFlag {
  key: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  environment: 'dev' | 'staging' | 'prod';
  updated_by: string;
  updated_at: string;
}

export interface SavedView {
  id: string;
  name: string;
  entity_type: 'kyc_cases' | 'refunds';
  filter_json: any;
  visible_columns: string[];
  sort_json: any;
  owner_role: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_json?: any;
  after_json?: any;
  reason?: string;
  created_at: string;
}
