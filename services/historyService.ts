
import { HistoryItem } from '../types';

const HISTORY_KEY = 'ai_studio_history';
const MAX_ITEMS = 20;

export const getHistory = (): HistoryItem[] => {
  try {
    const json = localStorage.getItem(HISTORY_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    };

    // Keep most recent items
    const updatedHistory = [newItem, ...history].slice(0, MAX_ITEMS);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error("Failed to save history (storage might be full)", e);
    // Simple fallback: try to clear half of history and save again to free up space for the new item
    try {
       const history = getHistory();
       const halfHistory = history.slice(0, Math.floor(history.length / 2));
       const newItem: HistoryItem = {
        ...item,
        id: generateId(),
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...halfHistory];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (retryError) {
        console.error("Failed to save history even after cleanup", retryError);
    }
  }
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};
