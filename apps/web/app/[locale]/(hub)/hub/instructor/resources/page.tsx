import { Metadata } from 'next';
import { ResourcesManagementClient } from './resources-management-client';

export const metadata: Metadata = {
  title: 'Manage Resources | LEAP LMS',
  description: 'Manage course resources',
};

export default function ResourcesManagementPage() {
  return <ResourcesManagementClient />;
}
