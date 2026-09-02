export interface CreateAuditInput {
  url: string;
}

export interface GetAuditInput {
  id: string;
}

export interface PageOutput {
  url: string;
  title?: string;
  domSnapshotSnippet?: string;
  inspectedAt: string;
}

export interface AuditOutput {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  findingsCount: number;
  page?: PageOutput;
}
