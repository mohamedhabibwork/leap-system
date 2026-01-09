import type { Metadata } from 'next';
import { metadataAPI } from '@/lib/seo/metadata-api';
import {
  generateDynamicMetadata,
  generateBreadcrumbSchema,
  formatJsonLd,
  truncateDescription,
} from '@/lib/seo/utils';
import { seoConfig } from '@/lib/seo/config';
import GroupDetailClient from './group-detail-client';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const groupId = parseInt(id);

  // Fetch group metadata
  const group = await metadataAPI.fetchGroupMetadata(groupId);

  if (!group) {
    return generateDynamicMetadata(
      'Group Not Found',
      'The requested group could not be found.',
      {
        canonical: `${seoConfig.siteUrl}/hub/social/groups/${groupId}`,
      }
    );
  }

  const title = `${group.name} - Community Group`;
  const description = truncateDescription(
    group.description ||
      `Join ${group.name} on LEAP PM. ${
        group.isPublic ? 'Public group' : 'Private group'
      } with ${group.memberCount} members.`
  );

  return generateDynamicMetadata(title, description, {
    image: group.coverImage,
    canonical: `${seoConfig.siteUrl}/hub/social/groups/${groupId}`,
    keywords: [
      group.name,
      'learning community',
      'discussion group',
      'study group',
      'social learning',
    ],
    type: 'article',
    noindex: !group.isPublic, // Only index public groups
  });
}

export default async function GroupPage({ params }: Props) {
  const { id } = await params;
  const groupId = parseInt(id);

  // Fetch group metadata for JSON-LD schema
  const group = await metadataAPI.fetchGroupMetadata(groupId);

  // Generate structured data if group exists
  let breadcrumbSchema = null;

  if (group) {
    breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: seoConfig.siteUrl },
      { name: 'Social', url: `${seoConfig.siteUrl}/hub/social` },
      { name: 'Groups', url: `${seoConfig.siteUrl}/hub/social/groups` },
      { name: group.name, url: `${seoConfig.siteUrl}/hub/social/groups/${groupId}` },
    ]);
  }

  return (
    <>
      {/* JSON-LD Schema */}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: formatJsonLd(breadcrumbSchema) }}
        />
      )}

      {/* Client Component */}
      <GroupDetailClient params={Promise.resolve({ id })} />
    </>
  );
}
