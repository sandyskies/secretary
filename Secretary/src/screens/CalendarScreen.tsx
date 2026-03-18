import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
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

export function CalendarScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [events, setEvents] = useState<BabyEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  React.useEffect(() => {
    loadEventsWithMarks();
  }, []);

  const loadEventsWithMarks = async () => {
    const allEvents = await EventStorage.getAllEvents();
    const marks: any = {};

    allEvents.forEach(event => {
      const dateKey = format(new Date(event.timestamp), 'yyyy-MM-dd');
      if (!marks[dateKey]) {
        marks[dateKey] = {
          marked: true,
          dotColor: '#007AFF',
          selectedDotColor: '#fff',
        };
      }
    });

    // Mark selected date
    marks[selectedDate] = {
      ...(marks[selectedDate] || { marked: true, dotColor: '#007AFF' }),
      selected: true,
      selectedColor: '#007AFF',
    };

    setMarkedDates(marks);

    // Load events for selected date
    const selectedEvents = allEvents.filter(
      e => format(new Date(e.timestamp), 'yyyy-MM-dd') === selectedDate
    );
    setEvents(selectedEvents.reverse());
  };

  const handleDayPress = async (day: any) => {
    setSelectedDate(day.dateString);
    const events = await EventStorage.getEventsByDate(new Date(day.dateString));
    setEvents(events.reverse());

    setMarkedDates({
      ...markedDates,
      [selectedDate]: { marked: true, dotColor: '#007AFF' },
      [day.dateString]: { marked: true, selected: true, selectedColor: '#007AFF', dotColor: '#fff' },
    });
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
        <Text style={styles.headerTitle}>事件日历</Text>
      </View>

      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#fff',
          todayTextColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />

      <ScrollView style={styles.eventsContainer}>
        <Text style={styles.dateTitle}>
          {format(new Date(selectedDate), 'yyyy年M月d日')}
        </Text>
        <Text style={styles.eventCount}>共 {events.length} 条记录</Text>

        {events.length === 0 ? (
          <Text style={styles.emptyText}>这一天没有记录</Text>
        ) : (
          events.map(event => (
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
                {event.duration && (
                  <Text style={styles.eventDetail}>{event.duration} 分钟</Text>
                )}
                {event.notes && (
                  <Text style={styles.eventNotes}>{event.notes}</Text>
                )}
              </View>
            </View>
          ))
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  eventsContainer: {
    padding: 20,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  eventCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 40,
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
});
