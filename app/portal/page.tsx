import type { Metadata } from 'next';
import EmployeePortalView from '@/components/portal/EmployeePortalView';

export const metadata: Metadata = {
  title: 'VASHIK — Employee Workspace & Deliverables',
  description: 'Employee deliverables countdown, task completion, points ledger, and leaderboard.'
};

export default function PortalPage() {
  return <EmployeePortalView />;
}
