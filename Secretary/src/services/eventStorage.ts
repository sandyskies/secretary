import AsyncStorage from '@react-native-async-storage/async-storage';
import { BabyEvent, DayEvents } from '../types/events';

const STORAGE_KEY = 'baby_events';

export class EventStorage {
  static async saveEvent(event: BabyEvent): Promise<void> {
    const allEvents = await this.getAllEvents();
    allEvents.push(event);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allEvents));
  }

  static async getAllEvents(): Promise<BabyEvent[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const events = JSON.parse(data);
      return events.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
        createdAt: new Date(e.createdAt),
      }));
    } catch (error) {
      console.error('Error loading events:', error);
      return [];
    }
  }

  static async getEventsByDate(date: Date): Promise<BabyEvent[]> {
    const allEvents = await this.getAllEvents();
    const targetDate = date.toDateString();
    return allEvents.filter(
      e => new Date(e.timestamp).toDateString() === targetDate
    );
  }

  static async getEventsByDateRange(start: Date, end: Date): Promise<BabyEvent[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(e => {
      const eventTime = new Date(e.timestamp).getTime();
      return eventTime >= start.getTime() && eventTime <= end.getTime();
    });
  }

  static async deleteEvent(id: string): Promise<void> {
    const allEvents = await this.getAllEvents();
    const filtered = allEvents.filter(e => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  static async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
