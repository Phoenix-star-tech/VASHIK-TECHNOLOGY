import type { Metadata } from 'next';
import AnnouncementsView from '@/components/portal/AnnouncementsView';

export const metadata: Metadata = {
  title: 'Official Announcements & News Feed — VASHIK TECHNOLOGIES',
  description: 'Official corporate notices, engineering dispatches, milestone achievements, and platform announcements from VASHIK TECHNOLOGIES.',
  alternates: {
    canonical: 'https://vashik.in/announcements',
  },
  openGraph: {
    title: 'Official Announcements & News Feed — VASHIK TECHNOLOGIES',
    description: 'Official corporate notices, engineering dispatches, milestone achievements, and platform announcements from VASHIK TECHNOLOGIES.',
    url: 'https://vashik.in/announcements',
  }
};

export default function AnnouncementsPage() {
  return <AnnouncementsView />;
}
