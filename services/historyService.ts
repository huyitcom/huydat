
import { HistoryItem } from '../types';
import { get, set, del } from 'idb-keyval';

const HISTORY_KEY = 'ai_studio_history';
const MAX_ITEMS = 20;

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const history = await get<HistoryItem[]>(HISTORY_KEY);
    return history || [];
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

export const addToHistory = async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  try {
    const history = await getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    };

    // Keep most recent items
    const updatedHistory = [newItem, ...history].slice(0, MAX_ITEMS);
    await set(HISTORY_KEY, updatedHistory);
  } catch (e) {
    console.error("Failed to save history (storage might be full)", e);
    // Simple fallback: try to clear half of history and save again to free up space for the new item
    try {
       const history = await getHistory();
       const halfHistory = history.slice(0, Math.floor(history.length / 2));
       const newItem: HistoryItem = {
        ...item,
        id: generateId(),
        timestamp: Date.now(),
      };
      const updatedHistory = [newItem, ...halfHistory];
      await set(HISTORY_KEY, updatedHistory);
    } catch (retryError) {
        console.error("Failed to save history even after cleanup", retryError);
    }
  }
};

export const clearHistory = async () => {
    await del(HISTORY_KEY);
};
