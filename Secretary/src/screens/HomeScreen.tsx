import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VoiceParser } from '../services/voiceParser';
import { EventStorage } from '../services/eventStorage';
import { BabyEvent, EventType } from '../types/events';

const EVENT_ICONS: Record<EventType, string> = {
  feeding: '🍼',
  bath: '🛁',
  poop: '💩',
  pee: '💧',
  diaperChange: '👶',
  sleep: '😴',
  medication: '💊',
  note: '📝',
};

const EVENT_NAMES: Record<EventType, string> = {
  feeding: '喝奶',
  bath: '洗澡',
  poop: '拉屎',
  pee: '拉尿',
  diaperChange: '换尿布',
  sleep: '睡觉',
  medication: '吃药',
  note: '备注',
};

export function HomeScreen({ navigation }: any) {
  const [recentEvents, setRecentEvents] = useState<BabyEvent[]>([]);
  const [lastVoiceText, setLastVoiceText] = useState('');

  useEffect(() => {
    loadRecentEvents();
  }, []);

  const loadRecentEvents = async () => {
    const today = new Date();
    const events = await EventStorage.getEventsByDate(today);
    setRecentEvents(events.reverse().slice(0, 5));
  };

  const handleRecordingComplete = async (text: string) => {
    setLastVoiceText(text);

    const parsed = VoiceParser.parse(text);
    if (parsed) {
      const newEvent: BabyEvent = {
        id: Date.now().toString(),
        type: parsed.type,
        timestamp: new Date(),
        notes: parsed.notes,
        feedingSide: parsed.feedingSide,
        createdAt: new Date(),
      };

      await EventStorage.saveEvent(newEvent);
      loadRecentEvents();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>宝宝护理助手</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('VoiceInput')}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>🎙️ 记录</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.calendarButton}>📅 日历</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近记录</Text>
          {recentEvents.length === 0 ? (
            <Text style={styles.emptyText}>今天还没有记录</Text>
          ) : (
            recentEvents.map(event => (
              <View key={event.id} style={styles.eventCard}>
                <Text style={styles.eventIcon}>{EVENT_ICONS[event.type]}</Text>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventType}>{EVENT_NAMES[event.type]}</Text>
                  <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
                  {event.feedingSide && (
                    <Text style={styles.eventDetail}>
                      {event.feedingSide === 'left' ? '左边' : event.feedingSide === 'right' ? '右边' : '奶瓶'}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {lastVoiceText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>语音识别</Text>
            <Text style={styles.voiceText}>"{lastVoiceText}"</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarButton: {
    fontSize: 20,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 20,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  eventDetail: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 4,
  },
  voiceText: {
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
});
