/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FitnessState, UserProfile, WeightLog, Meal } from '../types';

const STORAGE_KEY_PREFIX = 'kamba_fit_state_';

export const initialState: FitnessState = {
  profile: null,
  weightHistory: [],
  meals: [],
  completedExercises: [],
  lastAdjustmentDate: null,
  caloriesAdjustment: 0,
  chatHistory: [],
};

export const loadState = (userIdentifier?: string): FitnessState => {
  if (!userIdentifier) return initialState;
  const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userIdentifier}`);
  if (!saved) return initialState;
  try {
    return JSON.parse(saved);
  } catch {
    return initialState;
  }
};

export const saveState = (state: FitnessState, userIdentifier: string) => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userIdentifier}`, JSON.stringify(state));
  } catch (e) {
    console.error("Storage Error: Failed to save state (likely quota exceeded)", e);
    // If it's a quota error, we might want to clear old chat history to make room
    if (e instanceof Error && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      const simplifiedState = { ...state, chatHistory: state.chatHistory.slice(-5) }; // Keep only last 5 messages
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${userIdentifier}`, JSON.stringify(simplifiedState));
      } catch (innerError) {
        console.error("Critical Storage Failure", innerError);
      }
    }
  }
};
