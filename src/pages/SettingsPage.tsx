import { Icon } from '@/components/icons';

export function SettingsPage() {
  return (
    <div>
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg tone-primary flex items-center justify-center shrink-0">
          <Icon name="settings" size={18} />
        </div>
        <div>
          <h1 className="text-[22px] font-bold tracking-tight">الإعدادات</h1>
          <p className="text-[13.5px] text-[var(--muted-foreground)] mt-1">إدارة تفضيلات الحساب والنظام</p>
        </div>
      </div>
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl card-shadow p-6">
        <div className="text-[13.5px] text-[var(--muted-foreground)]">
          هذه الصفحة تجريبية — أضف إعدادات العلامة التجارية والمستخدمين والأذونات هنا.
        </div>
      </div>
    </div>
  );
}
