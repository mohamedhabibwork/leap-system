import { apiClient } from './client';

export interface Quiz {
  id: number;
  sectionId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
}

export interface QuizQuestion {
  id: number;
  questionTextEn: string;
  questionTextAr?: string;
  questionType: 'multiple_choice' | 'true_false' | 'essay';
  points: number;
  options?: {
    id: number;
    optionTextEn: string;
    optionTextAr?: string;
    displayOrder: number;
  }[];
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  attemptNumber: number;
  score: number;
  maxScore: number;
  isPassed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface SubmitQuizDto {
  attemptId: number;
  answers: Array<{
    questionId: number;
    selectedOptionId?: number;
    answerText?: string;
  }>;
}

export interface QuizResult {
  attemptId: number;
  score: number;
  maxScore: number;
  isPassed: boolean;
  passingScore: number;
}

/**
 * Quizzes API Service
 */
export const quizzesAPI = {
  /**
   * Start a quiz attempt
   */
  startAttempt: (quizId: number) =>
    apiClient.post<QuizAttempt>(`/lms/quizzes/${quizId}/start`),

  /**
   * Get quiz questions for taking
   */
  getQuestions: (quizId: number) =>
    apiClient.get<{ attemptId: number; questions: QuizQuestion[] }>(
      `/lms/quizzes/${quizId}/questions`,
    ),

  /**
   * Submit quiz answers
   */
  submitQuiz: (attemptId: number, data: Omit<SubmitQuizDto, 'attemptId'>) =>
    apiClient.post<QuizResult>(`/lms/quizzes/attempts/${attemptId}/submit`, {
      attemptId,
      ...data,
    }),

  /**
   * Get quiz attempt result
   */
  getResult: (attemptId: number) =>
    apiClient.get<QuizResult>(`/lms/quizzes/attempts/${attemptId}/result`),

  /**
   * Get my quiz attempts
   */
  getMyAttempts: () =>
    apiClient.get<QuizAttempt[]>(`/lms/quizzes/my-attempts`),

  /**
   * Pause a quiz attempt
   */
  pauseAttempt: (attemptId: number) =>
    apiClient.post(`/lms/quizzes/attempts/${attemptId}/pause`),

  /**
   * Resume a paused quiz attempt
   */
  resumeAttempt: (attemptId: number) =>
    apiClient.post(`/lms/quizzes/attempts/${attemptId}/resume`),

  /**
   * Get remaining time for quiz attempt
   */
  getTimeRemaining: (attemptId: number) =>
    apiClient.get<{ timeRemaining: number | null }>(
      `/lms/quizzes/attempts/${attemptId}/time-remaining`,
    ),

  /**
   * Flag a question for review
   */
  flagQuestion: (attemptId: number, questionId: number) =>
    apiClient.post(
      `/lms/quizzes/attempts/${attemptId}/flag/${questionId}`,
    ),
};
