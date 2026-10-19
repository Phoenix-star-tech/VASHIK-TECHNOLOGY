import type { Metadata } from 'next';
import AdminPortalView from '@/components/portal/AdminPortalView';

export const metadata: Metadata = {
  title: 'VASHIK — Administrator Authentication',
  description: 'Restricted administrative authentication for VASHIK portal management.'
};

export default function AdminLoginPage() {
  return <AdminPortalView />;
}
