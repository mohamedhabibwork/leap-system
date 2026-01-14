// Quiz and Question Bank Types

import type { QuizAttempt } from './instructor.types';

export interface QuestionOption {
  id: number;
  questionId: number;
  optionTextEn: string;
  optionTextAr?: string;
  isCorrect?: boolean; // Only shown to instructors or after quiz completion if showCorrectAnswers is true
  displayOrder: number;
}

export interface Question {
  id: number;
  courseId?: number | null; // null for general questions
  questionTypeId: number;
  questionTextEn: string;
  questionTextAr?: string;
  explanationEn?: string;
  explanationAr?: string;
  points: number;
  options?: QuestionOption[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Quiz {
  id: number;
  sectionId: number;
  lessonId?: number | null; // null for section-level quizzes
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
  createdAt: Date;
  updatedAt?: Date;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionId: number;
  displayOrder: number;
  question?: Question;
}

export interface QuizAnswer {
  id: number;
  attemptId: number;
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizAttemptResult extends QuizAttempt {
  quiz: {
    id: number;
    titleEn: string;
    titleAr?: string;
  };
  answers: Array<{
    questionId: number;
    questionTextEn: string;
    questionTextAr?: string;
    selectedOptionId?: number;
    answerText?: string;
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    options?: QuestionOption[];
  }>;
  showCorrectAnswers: boolean;
  passingScore: number;
}

export interface StartQuizResponse {
  attemptId: number;
  quiz: {
    id: number;
    titleEn: string;
    titleAr?: string;
    timeLimitMinutes?: number;
    shuffleQuestions: boolean;
  };
  attemptNumber: number;
  startedAt: Date;
}

export interface QuizQuestionsForTaking {
  attemptId: number;
  questions: Array<{
    id: number;
    questionTextEn: string;
    questionTextAr?: string;
    questionTypeId: number;
    points: number;
    displayOrder: number;
    options: Array<{
      id: number;
      optionTextEn: string;
      optionTextAr?: string;
      displayOrder: number;
      // isCorrect is not included for students taking the quiz
    }>;
  }>;
}

export interface SubmitQuizRequest {
  attemptId: number;
  answers: Array<{
    questionId: number;
    selectedOptionId?: number;
    answerText?: string;
  }>;
}

export interface SubmitQuizResponse {
  attemptId: number;
  score: number;
  maxScore: number;
  isPassed: boolean;
  passingScore: number;
}

// Resource Types

export interface CourseResource {
  id: number;
  courseId: number;
  sectionId?: number | null;
  lessonId?: number | null;
  resourceTypeId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  downloadCount: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ResourceDownloadResponse {
  resourceId: number;
  fileUrl: string;
  fileName?: string;
  downloadCount: number;
}

export interface CreateResourceRequest {
  courseId: number;
  sectionId?: number;
  lessonId?: number;
  resourceTypeId: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  displayOrder?: number;
}

export interface UpdateResourceRequest extends Partial<CreateResourceRequest> {}

// Question Bank Management Types

export interface CreateQuestionRequest {
  courseId?: number; // null for general questions
  questionTypeId: number;
  questionTextEn: string;
  questionTextAr?: string;
  explanationEn?: string;
  explanationAr?: string;
  points?: number;
  options: Array<{
    optionTextEn: string;
    optionTextAr?: string;
    isCorrect: boolean;
    displayOrder?: number;
  }>;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {}

export interface AddQuestionsToQuizRequest {
  questionIds: number[];
}

export interface AddQuestionsToQuizResponse {
  message: string;
  addedCount: number;
}

// Instructor Quiz Management Types

export interface CreateQuizRequest {
  sectionId: number;
  lessonId?: number;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {}
