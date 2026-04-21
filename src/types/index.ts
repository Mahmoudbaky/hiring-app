export type StatusKey = 'new' | 'review' | 'shortlisted' | 'interview' | 'rejected';

export type ToneKey = 'sky' | 'amber' | 'emerald' | 'rose' | 'violet' | 'slate' | 'neutral' | 'success';

export interface Attachment {
  type: 'pdf' | 'image' | 'link';
}

export interface Application {
  id: number;
  name: string;
  email: string;
  location: string;
  job: string;
  jobMeta: string;
  date: string;
  rawDate: string;
  status: StatusKey;
  attachments: Attachment[];
  avatar: ToneKey;
  manualAdd?: boolean;
}

export interface Job {
  id: number;
  title: string;
  dept: string;
  type: string;
  remote: boolean;
  salary: string;
  applicants: number;
  published: boolean;
  created: string;
}

export interface StatusMeta {
  label: string;
  tone: ToneKey;
}
