// Lesson Session types

export interface LessonSession {
  id: number;
  uuid: string;
  lessonId: number;
  titleEn: string;
  titleAr?: string;
  sessionType: 'live' | 'recorded' | 'hybrid';
  sessionTypeId: number;
  startTime: Date;
  endTime: Date;
  timezone: string;
  meetingUrl?: string;
  meetingPassword?: string;
  maxAttendees?: number;
  descriptionEn?: string;
  descriptionAr?: string;
  recordingUrl?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  statusId: number;
  attendanceCount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface SessionAttendee {
  id: number;
  uuid: string;
  sessionId: number;
  userId: number;
  enrollmentId: number;
  attendanceStatus: 'present' | 'absent' | 'late';
  attendanceStatusId: number;
  joinedAt?: Date;
  leftAt?: Date;
  durationMinutes?: number;
  createdAt: Date;
}

export interface CreateSessionDto {
  lessonId: number;
  titleEn: string;
  titleAr?: string;
  sessionType: 'live' | 'recorded' | 'hybrid';
  sessionTypeId: number;
  startTime: Date;
  endTime: Date;
  timezone?: string;
  meetingUrl?: string;
  meetingPassword?: string;
  maxAttendees?: number;
  descriptionEn?: string;
  descriptionAr?: string;
  statusId?: number;
}

export interface UpdateSessionDto extends Partial<CreateSessionDto> {}

export interface SessionWithDetails extends LessonSession {
  lessonTitle?: string;
  courseId?: number;
  courseName?: string;
}

export interface SessionFilters {
  courseId?: number;
  startDate?: Date;
  endDate?: Date;
  statusId?: number;
}
