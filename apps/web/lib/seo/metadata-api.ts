import type {
  CourseMetadata,
  UserMetadata,
  LessonMetadata,
  GroupMetadata,
} from './types';
import serverAPIClient from '@/lib/api/server-client';
import axios from 'axios';

/**
 * Server-side API client for fetching metadata
 * Note: This runs on the server, so we don't have access to client-side session
 */
class MetadataAPIClient {
  private async fetchWithTimeout<T>(
    url: string,
    timeout = 5000
  ): Promise<T> {
    try {
      const response = await axios.get<T>(url, {
        timeout,
        headers: {
          'Cache-Control': 'public, max-age=3600', // Revalidate every hour
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch course metadata for SEO
   */
  async fetchCourseMetadata(id: number): Promise<CourseMetadata | null> {
    try {
      const data = await serverAPIClient.get<CourseMetadata>(
        `/courses/${id}/metadata`
      );
      // Transform API response to CourseMetadata format
      return {
        id: data.id,
        title: data.title || data.titleEn || 'Untitled Course',
        description: data.description || data.descriptionEn || '',
        thumbnail: data.thumbnail || data.thumbnailUrl,
        price: data.price,
        currency: data.currency || 'USD',
        instructor: data.instructor
          ? {
              firstName: data.instructor.firstName || '',
              lastName: data.instructor.lastName || '',
              avatar: data.instructor.avatar || data.instructor.profilePicture,
            }
          : undefined,
        rating: data.rating || data.averageRating,
        reviewCount: data.reviewCount || data.totalReviews || 0,
        enrollmentCount: data.enrollmentCount || data.studentsCount || 0,
        duration: data.duration || data.durationHours,
        level: data.level,
        category: data.category?.name || data.categoryName,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching course metadata:', error);
      return null;
    }
  }

  /**
   * Fetch user metadata for SEO
   */
  async fetchUserMetadata(id: number): Promise<UserMetadata | null> {
    try {
      const data = await serverAPIClient.get<UserMetadata>(
        `/users/${id}/profile`
      );

      return {
        id: data.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        bio: data.bio || data.description,
        avatar: data.avatar || data.profilePicture,
        role: data.role || data.userType,
        isInstructor: data.isInstructor || data.roles?.includes('instructor') || false,
      };
    } catch (error) {
      console.error('Error fetching user metadata:', error);
      return null;
    }
  }

  /**
   * Fetch lesson metadata for SEO
   */
  async fetchLessonMetadata(
    courseId: number,
    lessonId: number
  ): Promise<LessonMetadata | null> {
    try {
      const data = await serverAPIClient.get<LessonMetadata>(
        `/courses/${courseId}/lessons/${lessonId}`
      );

      return {
        id: data.id,
        title: data.title || data.titleEn || 'Untitled Lesson',
        description: data.description || data.descriptionEn,
        courseId: data.courseId || courseId,
        courseTitle: data.course?.title || data.course?.titleEn || '',
        videoUrl: data.videoUrl,
        durationMinutes: data.durationMinutes || data.duration,
        order: data.order || data.orderIndex,
      };
    } catch (error) {
      console.error('Error fetching lesson metadata:', error);
      return null;
    }
  }

  /**
   * Fetch group metadata for SEO
   */
  async fetchGroupMetadata(id: number): Promise<GroupMetadata | null> {
    try {
      const data = await serverAPIClient.get<GroupMetadata>(
        `/groups/${id}`
      );

      return {
        id: data.id,
        name: data.name || 'Untitled Group',
        description: data.description,
        coverImage: data.coverImage || data.coverPhoto,
        memberCount: data.memberCount || data.membersCount || 0,
        isPublic: data.isPublic !== false,
      };
    } catch (error) {
      console.error('Error fetching group metadata:', error);
      return null;
    }
  }

  /**
   * Fetch all public courses for sitemap
   */
  async fetchAllCourses(): Promise<Array<{ id: number; updatedAt: string }>> {
    try {
      const data = await serverAPIClient.get<Array<{ id: number; updatedAt: string }> | { courses: Array<{ id: number; updatedAt: string }> }>(
        `/lms/courses?public=true&fields=id,updatedAt`
      );
      return Array.isArray(data) ? data : data.courses || [];
    } catch (error) {
      console.error('Error fetching courses for sitemap:', error);
      return [];
    }
  }

  /**
   * Fetch all public user profiles for sitemap
   */
  async fetchAllPublicUsers(): Promise<Array<{ id: number; updatedAt: string }>> {
    try {
      const data = await serverAPIClient.get<Array<{ id: number; updatedAt: string }> | { users: Array<{ id: number; updatedAt: string }> }>(
        `/users?public=true&fields=id,updatedAt`
      );
      return Array.isArray(data) ? data : data.users || [];
    } catch (error) {
      console.error('Error fetching users for sitemap:', error);
      return [];
    }
  }
}

// Export singleton instance
export const metadataAPI = new MetadataAPIClient();
