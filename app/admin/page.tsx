import type { Metadata } from 'next';
import AdminPortalView from '@/components/portal/AdminPortalView';

export const metadata: Metadata = {
  title: 'VASHIK — Administration Management Suite',
  description: 'Personnel roster management, deliverables delegation, and audited points ledger.'
};

export default function AdminPage() {
  return <AdminPortalView />;
}
