/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  birthYear: number;
  weight: number;
  height: number;
  sex: 'M' | 'F';
  province: string;
  level: 'beginner' | 'intermediate';
  daysPerWeek: number;
  trainingDays: number[]; // Array of day indices (0-6, where 0 is Sunday)
  goal: 'mass' | 'loss';
  hasGymAccess: boolean;
  accountCreated: boolean;
  onboardingCompleted: boolean;
  role?: 'user' | 'admin';
  workoutOverrides?: Record<number, WorkoutDay>;
}

export interface WeightLog {
  date: string;
  weight: number;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  description?: string;
  videoUrl?: string;
  completed?: boolean;
}

export interface WorkoutDay {
  id: string;
  label: string;
  exercises: Exercise[];
}

export interface CompletedExercise {
  exerciseName: string;
  date: string; // ISO date string YYYY-MM-DD
}

export interface FitnessState {
  profile: UserProfile | null;
  weightHistory: WeightLog[];
  meals: Meal[];
  mealHistory?: Meal[]; // Archive of all meals logged
  completedExercises?: CompletedExercise[];
  lastLoginDate?: string;
  lastAdjustmentDate: string | null;
  caloriesAdjustment: number; // For the +/- 200/100 kcal logic
  chatHistory?: ChatMessage[];
}

export interface ChatMessage {
  text: string;
  isBot: boolean;
  image?: string;
}
