import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventStorage } from '../services/eventStorage';
import { BabyEvent, EventType } from '../types/events';
import { format, startOfDay, endOfDay, isToday } from 'date-fns';

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

interface EventsListScreenProps {
  navigation?: any;
}

export function EventsListScreen({ navigation }: EventsListScreenProps) {
  const [events, setEvents] = React.useState<BabyEvent[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<'today' | 'week'>('today');

  React.useEffect(() => {
    loadEvents();
  }, [selectedPeriod]);

  const loadEvents = async () => {
    let loadedEvents: BabyEvent[];

    if (selectedPeriod === 'today') {
      const now = new Date();
      loadedEvents = await EventStorage.getEventsByDateRange(
        startOfDay(now),
        endOfDay(now)
      );
    } else {
      // Last 7 days
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      loadedEvents = await EventStorage.getEventsByDateRange(weekAgo, endOfDay(now));
    }

    setEvents(loadedEvents.reverse());
  };

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const time = d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!isToday(d)) {
      const dateStr = format(d, 'M月d日');
      return `${dateStr} ${time}`;
    }

    return time;
  };

  const deleteEvent = async (id: string) => {
    await EventStorage.deleteEvent(id);
    loadEvents();
  };

  const getTodayStats = () => {
    if (selectedPeriod === 'week') return null;

    const today = new Date();
    return events.reduce((stats, event) => {
      const eventTime = new Date(event.timestamp);
      if (isToday(eventTime)) {
        if (event.type === 'feeding') stats.feeding++;
        if (event.type === 'poop') stats.poop++;
        if (event.type === 'pee') stats.pee++;
        if (event.type === 'diaperChange') stats.diapers++;
      }
      return stats;
    }, { feeding: 0, poop: 0, pee: 0, diapers: 0 });
  };

  const stats = getTodayStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>事件记录</Text>
        <TouchableOpacity onPress={loadEvents}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('today')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'today' && styles.periodButtonTextActive]}>
            今天
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
          onPress={() => setSelectedPeriod('week')}
        >
          <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
            近7天
          </Text>
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🍼</Text>
            <Text style={styles.statValue}>{stats.feeding}</Text>
            <Text style={styles.statLabel}>喝奶</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💩</Text>
            <Text style={styles.statValue}>{stats.poop}</Text>
            <Text style={styles.statLabel}>拉屎</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💧</Text>
            <Text style={styles.statValue}>{stats.pee}</Text>
            <Text style={styles.statLabel}>拉尿</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👶</Text>
            <Text style={styles.statValue}>{stats.diapers}</Text>
            <Text style={styles.statLabel}>尿布</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.eventsList}>
        {events.length === 0 ? (
          <Text style={styles.emptyText}>暂无记录</Text>
        ) : (
          events.map(event => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onLongPress={() => deleteEvent(event.id)}
            >
              <Text style={styles.eventIcon}>{EVENT_ICONS[event.type]}</Text>
              <View style={styles.eventInfo}>
                <Text style={styles.eventType}>{EVENT_NAMES[event.type]}</Text>
                <Text style={styles.eventTime}>{formatDateTime(event.timestamp)}</Text>
                {event.feedingSide && (
                  <Text style={styles.eventDetail}>
                    {event.feedingSide === 'left' ? '左边' : event.feedingSide === 'right' ? '右边' : '奶瓶'}
                  </Text>
                )}
                {event.duration && (
                  <Text style={styles.eventDetail}>{event.duration} 分钟</Text>
                )}
                {event.notes && (
                  <Text style={styles.eventNotes}>{event.notes}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteEvent(event.id)}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {events.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={async () => {
            if (selectedPeriod === 'today') {
              const today = new Date();
              const todayEvents = await EventStorage.getEventsByDateRange(
                startOfDay(today),
                endOfDay(today)
              );
              for (const event of todayEvents) {
                await EventStorage.deleteEvent(event.id);
              }
              loadEvents();
            }
          }}
        >
          <Text style={styles.clearButtonText}>清空今天记录</Text>
        </TouchableOpacity>
      )}
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  refreshIcon: {
    fontSize: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 60,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginBottom: 4,
  },
  eventDetail: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  eventNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 18,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
