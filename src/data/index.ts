import type { Application, Job, StatusKey, StatusMeta } from '@/types';

export const SEED_APPLICATIONS: Application[] = [
  { id: 1, name: 'عبدالرحمن القحطاني', email: 'a.qahtani@example.com', location: 'الرياض، السعودية',
    job: 'مطور Laravel (Senior)', jobMeta: 'خبرة 5 سنوات',
    date: 'اليوم، 09:15 ص', rawDate: '2026-04-21', status: 'new',
    attachments: [{ type: 'pdf' }, { type: 'link' }], avatar: 'violet' },
  { id: 2, name: 'نورة السبيعي', email: 'n.subaie@example.com', location: 'جدة، السعودية',
    job: 'مصمم واجهات UI/UX', jobMeta: 'خبرة 3 سنوات',
    date: 'أمس، 04:30 م', rawDate: '2026-04-20', status: 'review',
    attachments: [{ type: 'pdf' }, { type: 'link' }], avatar: 'emerald' },
  { id: 3, name: 'فهد الشمري', email: 'f.shammari@example.com', location: 'الدمام، السعودية',
    job: 'مدير مشاريع تقنية', jobMeta: 'PMP Certified',
    date: '17 أبريل 2026', rawDate: '2026-04-17', status: 'shortlisted',
    attachments: [{ type: 'pdf' }], avatar: 'sky' },
  { id: 4, name: 'منى الهاشم', email: 'm.hashem@example.com', location: 'دبي، الإمارات',
    job: 'أخصائي تسويق رقمي', jobMeta: 'خبرة 4 سنوات',
    date: '16 أبريل 2026', rawDate: '2026-04-16', status: 'interview',
    attachments: [{ type: 'pdf' }, { type: 'image' }], avatar: 'rose' },
  { id: 5, name: 'سلطان الدوسري', email: 's.dosari@example.com', location: 'الكويت',
    job: 'مطور تطبيقات Mobile', jobMeta: 'خبرة سنة واحدة',
    date: '15 أبريل 2026', rawDate: '2026-04-15', status: 'rejected',
    attachments: [{ type: 'pdf' }], avatar: 'slate' },
  { id: 6, name: 'سارة الشمري', email: 'sara.s@example.com', location: 'الرياض، السعودية',
    job: 'مصمم واجهات UI/UX', jobMeta: 'خبرة سنتين',
    date: '14 أبريل 2026', rawDate: '2026-04-14', status: 'review',
    attachments: [{ type: 'pdf' }], avatar: 'amber' },
  { id: 7, name: 'خالد منصور', email: 'k.mansour@example.com', location: 'الرياض، السعودية',
    job: 'مطور Laravel (Mid)', jobMeta: 'خبرة 3 سنوات',
    date: '12 أبريل 2026', rawDate: '2026-04-12', status: 'shortlisted',
    attachments: [{ type: 'pdf' }, { type: 'link' }], avatar: 'emerald' },
  { id: 8, name: 'ريم عبدالله', email: 'reem@example.com', location: 'الرياض، السعودية',
    job: 'مصمم جرافيك', jobMeta: 'خبرة سنتين',
    date: '10 أبريل 2026', rawDate: '2026-04-10', status: 'review',
    attachments: [{ type: 'pdf' }, { type: 'image' }], avatar: 'violet' },
  { id: 9, name: 'سعد الغامدي', email: 'saad@example.com', location: 'الرياض، السعودية',
    job: 'مطور واجهات (React)', jobMeta: 'خبرة 4 سنوات',
    date: '8 أبريل 2026', rawDate: '2026-04-08', status: 'new',
    attachments: [{ type: 'pdf' }], avatar: 'sky' },
];

export const STATUS_META: Record<StatusKey, StatusMeta> = {
  new:         { label: 'جديد',         tone: 'sky' },
  review:      { label: 'قيد المراجعة', tone: 'amber' },
  shortlisted: { label: 'تم الترشيح',   tone: 'emerald' },
  interview:   { label: 'موعد مقابلة',  tone: 'violet' },
  rejected:    { label: 'مرفوض',        tone: 'rose' },
};

export const SEED_JOBS: Job[] = [
  { id: 1, title: 'مطور Laravel (Senior)', dept: 'التطوير البرمجي', type: 'دوام كامل', remote: false, salary: '18,000 – 26,000 ر.س', applicants: 42, published: true,  created: 'منذ 3 أيام' },
  { id: 2, title: 'مصمم واجهات UI/UX',    dept: 'التصميم',         type: 'دوام كامل', remote: true,  salary: '14,000 – 20,000 ر.س', applicants: 27, published: true,  created: 'منذ أسبوع' },
  { id: 3, title: 'مدير مشاريع تقنية',     dept: 'إدارة المنتج',    type: 'دوام كامل', remote: false, salary: '22,000 – 32,000 ر.س', applicants: 15, published: true,  created: 'منذ 10 أيام' },
  { id: 4, title: 'أخصائي تسويق رقمي',    dept: 'التسويق',         type: 'عن بعد',    remote: true,  salary: '10,000 – 15,000 ر.س', applicants: 31, published: false, created: 'منذ يومين' },
  { id: 5, title: 'مطور واجهات (React)',  dept: 'التطوير البرمجي', type: 'عن بعد',    remote: true,  salary: '16,000 – 22,000 ر.س', applicants: 19, published: true,  created: 'منذ 5 أيام' },
  { id: 6, title: 'مصمم جرافيك',          dept: 'التصميم',         type: 'دوام جزئي', remote: true,  salary: '6,000 – 10,000 ر.س',  applicants: 12, published: true,  created: 'منذ أسبوعين' },
];

export const DEPARTMENTS = [
  'التطوير البرمجي', 'التصميم', 'إدارة المنتج', 'التسويق',
  'الموارد البشرية', 'المبيعات', 'العمليات',
];
