import type { Metadata } from 'next';
import { metadataAPI } from '@/lib/seo/metadata-api';
import {
  generateDynamicMetadata,
  generatePersonSchema,
  generateBreadcrumbSchema,
  formatJsonLd,
  truncateDescription,
} from '@/lib/seo/utils';
import { seoConfig } from '@/lib/seo/config';
import UserProfileClient from './user-profile-client';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const userId = parseInt(id);

  // Fetch user metadata
  const user = await metadataAPI.fetchUserMetadata(userId);

  if (!user) {
    return generateDynamicMetadata(
      'User Not Found',
      'The requested user profile could not be found.',
      {
        canonical: `${seoConfig.siteUrl}/hub/users/${userId}`,
      }
    );
  }

  const name = `${user.firstName} ${user.lastName}`;
  const title = `${name} - Profile`;
  const description = truncateDescription(
    user.bio ||
      `View ${name}'s profile on LEAP PM. ${
        user.isInstructor ? 'Instructor and course creator.' : 'Student and learner.'
      }`
  );

  return generateDynamicMetadata(title, description, {
    image: user.avatar,
    canonical: `${seoConfig.siteUrl}/hub/users/${userId}`,
    keywords: [
      name,
      user.isInstructor ? 'instructor' : 'student',
      'LEAP PM profile',
      'online learner',
    ],
    type: 'profile',
  });
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const userId = parseInt(id);

  // Fetch user metadata for JSON-LD schema
  const user = await metadataAPI.fetchUserMetadata(userId);

  // Generate structured data if user exists
  let personSchema = null;
  let breadcrumbSchema = null;

  if (user) {
    personSchema = generatePersonSchema(user);
    const name = `${user.firstName} ${user.lastName}`;
    breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: seoConfig.siteUrl },
      { name: 'Community', url: `${seoConfig.siteUrl}/hub/users` },
      { name, url: `${seoConfig.siteUrl}/hub/users/${userId}` },
    ]);
  }

  return (
    <>
      {/* JSON-LD Schemas */}
      {personSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: formatJsonLd(personSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: formatJsonLd(breadcrumbSchema) }}
        />
      )}

      {/* Client Component */}
      <UserProfileClient params={Promise.resolve({ id })} />
    </>
  );
}
