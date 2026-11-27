import { isRTL } from './i18n';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Levantine month names, as used in Jordan.
const MONTHS_AR = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
const months = () => (isRTL() ? MONTHS_AR : MONTHS_EN);
export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const isISODate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export const isTime = (s: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);

export function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${months()[m - 1]} ${y}`;
}

export function formatTimestamp(ms: number) {
  const d = new Date(ms);
  return `${d.getDate()} ${months()[d.getMonth()]} ${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function daysUntil(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 86_400_000);
}

export const money = (n: number) => `${n.toFixed(n % 1 ? 2 : 0)} ${isRTL() ? 'د.أ' : 'JOD'}`;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export function attendanceRate(records: { status: string }[]) {
  if (!records.length) return null;
  const ok = records.filter((r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Excused').length;
  return Math.round((ok / records.length) * 100);
}
