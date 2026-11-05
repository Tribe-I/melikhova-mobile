import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Ratings } from './types';

// Тот же ключ, что на лендинге. Оценки хранятся только на этом телефоне.
const KEY = 'dpo-checklist-v1';

export async function loadRatings(): Promise<Ratings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveRatings(ratings: Ratings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ratings));
  } catch {
    // Если записать не удалось, приложение продолжает работать без сохранения.
  }
}
