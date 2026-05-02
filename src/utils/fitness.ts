/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, WeightLog, Meal, WorkoutDay, Exercise } from '../types';
import { BODYWEIGHT_EXERCISES, GYM_EXERCISES } from '../constants';

export const calculateBMR = (profile: UserProfile): number => {
  const age = new Date().getFullYear() - profile.birthYear;
  // Mifflin-St Jeor Equation
  let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * age);
  if (profile.sex === 'M') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return bmr;
};

export const calculateTargets = (profile: UserProfile, adjustment: number = 0) => {
  const bmr = calculateBMR(profile);
  // Assuming moderate activity factor of 1.55 for users wanting to build mass
  const tdee = bmr * 1.55;
  const targetCalories = tdee + 400 + adjustment;

  const protein = profile.weight * 2;
  const fat = profile.weight * 0.8;
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbCals = targetCalories - proteinCals - fatCals;
  const carbs = carbCals / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
};

export const generateWorkoutPlan = (profile: UserProfile): WorkoutDay[] => {
  const { daysPerWeek, hasGymAccess } = profile;
  const source = hasGymAccess ? GYM_EXERCISES : BODYWEIGHT_EXERCISES;
  const plan: WorkoutDay[] = [];

  if (daysPerWeek <= 3) {
    plan.push({ id: '1', label: 'Empurrar (Push)', exercises: source.push });
    plan.push({ id: '2', label: 'Puxar (Pull)', exercises: source.pull });
    plan.push({ id: '3', label: 'Pernas (Legs)', exercises: source.legs });
  } else if (daysPerWeek === 4) {
    const upper = [...source.push, ...source.pull].slice(0, 5);
    const lower = [...source.legs];
    plan.push({ id: '1', label: 'Superior A', exercises: upper });
    plan.push({ id: '2', label: 'Inferior A', exercises: lower });
    plan.push({ id: '3', label: 'Superior B', exercises: upper });
    plan.push({ id: '4', label: 'Inferior B', exercises: lower });
  } else {
    plan.push({ id: '1', label: 'Peito & Tríceps', exercises: [source.push[0], source.push[2], source.push[3]] });
    plan.push({ id: '2', label: 'Costas & Bíceps', exercises: [source.pull[0], source.pull[1], source.pull[2]] });
    plan.push({ id: '3', label: 'Pernas', exercises: source.legs });
    plan.push({ id: '4', label: 'Ombros', exercises: [source.push[1], ...source.push.slice(2, 3)] });
    plan.push({ id: '5', label: 'Braços & Cardio', exercises: [source.pull[2], source.push[2], { name: 'Corrida Leve', sets: 1, reps: '20 min' }] });
    if (daysPerWeek === 6) {
      plan.push({ id: '6', label: 'Pernas (Foco)', exercises: source.legs });
    }
  }

  return plan;
};

export const getWorkoutForDay = (profile: UserProfile, plan: WorkoutDay[], dayOfWeek: number) => {
  // dayOfWeek: 0 (Sun) to 6 (Sat)
  if (plan.length === 0 && !profile.workoutOverrides?.[dayOfWeek]) return null;
  
  // Check for specific day overrides first (Boss AI mode)
  if (profile.workoutOverrides?.[dayOfWeek]) {
    return profile.workoutOverrides[dayOfWeek];
  }

  // Custom training days if available
  if (profile.trainingDays && profile.trainingDays.length > 0) {
    const isTrainingDay = profile.trainingDays.includes(dayOfWeek);
    if (!isTrainingDay) return null;

    // Find the index of this day in the training days array to pick the right routine
    // trainingDays is usually sorted.
    const sortedTrainingDays = [...profile.trainingDays].sort();
    const trainingDayIndex = sortedTrainingDays.indexOf(dayOfWeek);
    
    // Safety check: wrap around if plan is smaller than training days count
    return plan[trainingDayIndex % plan.length];
  }

  // Fallback to legacy logic based on daysPerWeek
  const { daysPerWeek } = profile;
  // Monday starting logic (1=Mon, 6=Sat, 0=Sun)
  
  if (daysPerWeek === 3) {
    // Mon, Wed, Fri
    if (dayOfWeek === 1) return plan[0];
    if (dayOfWeek === 3) return plan[1];
    if (dayOfWeek === 5) return plan[2];
    return null;
  }
  
  if (daysPerWeek === 4) {
    // Mon, Tue, Thu, Fri
    if (dayOfWeek === 1) return plan[0];
    if (dayOfWeek === 2) return plan[1];
    if (dayOfWeek === 4) return plan[2];
    if (dayOfWeek === 5) return plan[3];
    return null;
  }
  
  if (daysPerWeek === 5) {
    // Mon, Tue, Wed, Fri, Sat
    if (dayOfWeek === 1) return plan[0];
    if (dayOfWeek === 2) return plan[1];
    if (dayOfWeek === 3) return plan[2];
    if (dayOfWeek === 5) return plan[3];
    if (dayOfWeek === 6) return plan[4];
    return null;
  }
  
  if (daysPerWeek === 6) {
    // Mon-Sat
    if (dayOfWeek === 0) return null;
    return plan[dayOfWeek - 1];
  }

  // 7 days (fallback)
  return plan[dayOfWeek % plan.length];
};

export const getDailyWorkout = (profile: UserProfile, plan: WorkoutDay[]) => {
  const dayOfWeek = new Date().getDay(); 
  return getWorkoutForDay(profile, plan, dayOfWeek);
};
