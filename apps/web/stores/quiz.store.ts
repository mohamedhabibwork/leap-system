import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { quizzesAPI } from '@/lib/api/quizzes';

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

export interface Answer {
  questionId: number;
  selectedOptionId?: number;
  answerText?: string;
  isFlagged?: boolean;
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

export interface QuizResult {
  attemptId: number;
  score: number;
  maxScore: number;
  isPassed: boolean;
  passingScore: number;
}

interface ActiveQuiz {
  quizId: number;
  attemptId: number;
  questions: QuizQuestion[];
  answers: Map<number, Answer>;
  startTime: Date;
  timeLimit: number | null; // in seconds
  currentQuestionIndex: number;
}

interface QuizState {
  // Active Quiz Session
  activeQuiz: ActiveQuiz | null;
  
  // Timer
  timeRemaining: number | null; // in seconds
  timerActive: boolean;
  
  // Quiz History
  attempts: Record<number, QuizAttempt[]>; // quizId -> attempts
  
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Actions
  startQuiz: (quizId: number, questions: QuizQuestion[], attemptId: number, timeLimit?: number) => void;
  answerQuestion: (questionId: number, answer: Answer) => void;
  submitQuiz: () => Promise<QuizResult>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  flagQuestion: (questionId: number) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  updateTimeRemaining: (seconds: number) => void;
  fetchTimeRemaining: () => Promise<void>;
  clearActiveQuiz: () => void;
  
  // Results
  addAttempt: (quizId: number, attempt: QuizAttempt) => void;
  getAttempts: (quizId: number) => QuizAttempt[];
  getBestScore: (quizId: number) => number;
}

export const useQuizStore = create<QuizState>()(
  devtools(
    (set, get) => ({
      activeQuiz: null,
      timeRemaining: null,
      timerActive: false,
      attempts: {},
      isLoading: false,
      isSubmitting: false,
      error: null,

      startQuiz: (quizId, questions, attemptId, timeLimit = undefined) => {
        set({
          activeQuiz: {
            quizId,
            attemptId,
            questions,
            answers: new Map(),
            startTime: new Date(),
            timeLimit: timeLimit ?? null,
            currentQuestionIndex: 0,
          },
          timeRemaining: timeLimit ?? null,
          timerActive: timeLimit !== undefined && timeLimit !== null,
        });
      },

      answerQuestion: (questionId, answer) => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz) return;

        const answers = new Map(activeQuiz.answers);
        answers.set(questionId, answer);

        set({
          activeQuiz: {
            ...activeQuiz,
            answers,
          },
        });
      },

      submitQuiz: async () => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz) {
          throw new Error('No active quiz');
        }

        set({ isSubmitting: true, error: null, timerActive: false });

        try {
          // Convert answers map to array format
          const answers = Array.from(activeQuiz.answers.values()).map((answer) => ({
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
            answerText: answer.answerText,
          }));

          // Submit quiz via API
          const result = await quizzesAPI.submitQuiz(activeQuiz.attemptId, { answers });

          // Add attempt to history
          const attempt: QuizAttempt = {
            id: activeQuiz.attemptId,
            quizId: activeQuiz.quizId,
            attemptNumber: 1, // Will be updated from API response
            score: result.score,
            maxScore: result.maxScore,
            isPassed: result.isPassed,
            startedAt: activeQuiz.startTime,
            completedAt: new Date(),
          };
          get().addAttempt(activeQuiz.quizId, attempt);

          // Clear active quiz
          get().clearActiveQuiz();

          return result;
        } catch (error: any) {
          set({ error: error.message || 'Failed to submit quiz' });
          throw error;
        } finally {
          set({ isSubmitting: false });
        }
      },

      nextQuestion: () => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz) return;

        if (activeQuiz.currentQuestionIndex < activeQuiz.questions.length - 1) {
          set({
            activeQuiz: {
              ...activeQuiz,
              currentQuestionIndex: activeQuiz.currentQuestionIndex + 1,
            },
          });
        }
      },

      previousQuestion: () => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz) return;

        if (activeQuiz.currentQuestionIndex > 0) {
          set({
            activeQuiz: {
              ...activeQuiz,
              currentQuestionIndex: activeQuiz.currentQuestionIndex - 1,
            },
          });
        }
      },

      goToQuestion: (index: number) => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz) return;

        if (index >= 0 && index < activeQuiz.questions.length) {
          set({
            activeQuiz: {
              ...activeQuiz,
              currentQuestionIndex: index,
            },
          });
        }
      },

      flagQuestion: async (questionId: number) => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz) return;

        try {
          // Call API to flag question
          await quizzesAPI.flagQuestion(activeQuiz.attemptId, questionId);

          // Update local state
          const answer = activeQuiz.answers.get(questionId);
          get().answerQuestion(questionId, {
            ...answer,
            questionId,
            isFlagged: !answer?.isFlagged,
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to flag question' });
        }
      },

      pauseTimer: async () => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz) return;

        try {
          await quizzesAPI.pauseAttempt(activeQuiz.attemptId);
          set({ timerActive: false });
        } catch (error: any) {
          set({ error: error.message || 'Failed to pause quiz' });
        }
      },

      resumeTimer: async () => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz || activeQuiz.timeLimit === null) return;

        try {
          await quizzesAPI.resumeAttempt(activeQuiz.attemptId);
          set({ timerActive: true });
        } catch (error: any) {
          set({ error: error.message || 'Failed to resume quiz' });
        }
      },

      updateTimeRemaining: (seconds: number) => {
        set({ timeRemaining: seconds });
        
        // Auto-submit when time expires
        if (seconds <= 0 && get().timerActive) {
          get().submitQuiz().catch(() => {
            // Handle error silently or show notification
          });
        }
      },

      fetchTimeRemaining: async () => {
        const activeQuiz = get().activeQuiz;
        if (!activeQuiz) return;

        try {
          const response = await quizzesAPI.getTimeRemaining(activeQuiz.attemptId);
          if (response.timeRemaining !== null) {
            set({ timeRemaining: response.timeRemaining });
            // Auto-submit if time expired
            if (response.timeRemaining <= 0) {
              await get().submitQuiz();
            }
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to fetch time remaining' });
        }
      },

      clearActiveQuiz: () => {
        set({
          activeQuiz: null,
          timeRemaining: null,
          timerActive: false,
        });
      },

      addAttempt: (quizId, attempt) => {
        const attempts = get().attempts[quizId] || [];
        set({
          attempts: {
            ...get().attempts,
            [quizId]: [...attempts, attempt],
          },
        });
      },

      getAttempts: (quizId) => {
        return get().attempts[quizId] || [];
      },

      getBestScore: (quizId) => {
        const attempts = get().attempts[quizId] || [];
        if (attempts.length === 0) return 0;
        return Math.max(...attempts.map((a) => a.score));
      },
    }),
    { name: 'quiz-store' }
  )
);

// Selectors
export const selectActiveQuiz = (state: QuizState) => state.activeQuiz;
export const selectTimeRemaining = (state: QuizState) => state.timeRemaining;
export const selectIsTimerActive = (state: QuizState) => state.timerActive;
export const selectQuizAttempts = (quizId: number) => (state: QuizState) =>
  state.attempts[quizId] || [];
