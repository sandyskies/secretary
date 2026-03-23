import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventStorage } from "../services/eventStorage";
import { BabyEvent, EventType } from "../types/events";
import { format, startOfDay, endOfDay, isToday } from "date-fns";

const EVENT_ICONS: Record<EventType, string> = {
  feeding: "🍼",
  bath: "🛁",
  poop: "💩",
  pee: "💧",
  diaperChange: "👶",
  sleep: "😴",
  medication: "💊",
  note: "📝",
};

const EVENT_NAMES: Record<EventType, string> = {
  feeding: "喝奶",
  bath: "洗澡",
  poop: "拉屎",
  pee: "拉尿",
  diaperChange: "换尿布",
  sleep: "睡觉",
  medication: "吃药",
  note: "备注",
};

interface EventsListScreenProps {
  navigation?: any;
}

export function EventsListScreen({ navigation }: EventsListScreenProps) {
  const [events, setEvents] = React.useState<BabyEvent[]>([]);
  const [selectedPeriod, setSelectedPeriod] = React.useState<"today" | "week">(
    "today",
  );

  React.useEffect(() => {
    loadEvents();
  }, [selectedPeriod]);

  const loadEvents = async () => {
    let loadedEvents: BabyEvent[];

    if (selectedPeriod === "today") {
      const now = new Date();
      loadedEvents = await EventStorage.getEventsByDateRange(
        startOfDay(now),
        endOfDay(now),
      );
    } else {
      // Last 7 days
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      loadedEvents = await EventStorage.getEventsByDateRange(
        weekAgo,
        endOfDay(now),
      );
    }

    setEvents(loadedEvents.reverse());
  };

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const time = d.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (!isToday(d)) {
      const dateStr = format(d, "M月d日");
      return `${dateStr} ${time}`;
    }

    return time;
  };

  const deleteEvent = async (id: string) => {
    await EventStorage.deleteEvent(id);
    loadEvents();
  };

  const getTodayStats = () => {
    if (selectedPeriod === "week") return null;

    return events.reduce(
      (stats, event) => {
        const eventTime = new Date(event.timestamp);
        if (isToday(eventTime)) {
          if (event.type === "feeding") stats.feeding++;
          if (event.type === "poop") stats.poop++;
          if (event.type === "pee") stats.pee++;
          if (event.type === "diaperChange") stats.diapers++;
        }
        return stats;
      },
      { feeding: 0, poop: 0, pee: 0, diapers: 0 },
    );
  };

  const stats = getTodayStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>事件记录</Text>
        <TouchableOpacity onPress={loadEvents}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === "today" && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod("today")}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === "today" && styles.periodButtonTextActive,
            ]}
          >
            今天
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === "week" && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod("week")}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === "week" && styles.periodButtonTextActive,
            ]}
          >
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
          events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onLongPress={() => deleteEvent(event.id)}
            >
              <Text style={styles.eventIcon}>{EVENT_ICONS[event.type]}</Text>
              <View style={styles.eventInfo}>
                <Text style={styles.eventType}>{EVENT_NAMES[event.type]}</Text>
                <Text style={styles.eventTime}>
                  {formatDateTime(event.timestamp)}
                </Text>
                {event.feedingSide && (
                  <Text style={styles.eventDetail}>
                    {event.feedingSide === "left"
                      ? "左边"
                      : event.feedingSide === "right"
                        ? "右边"
                        : "奶瓶"}
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
            if (selectedPeriod === "today") {
              const today = new Date();
              const todayEvents = await EventStorage.getEventsByDateRange(
                startOfDay(today),
                endOfDay(today),
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
  backButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  backIcon: {
    color: "#007AFF",
    fontSize: 28,
  },
  clearButton: {
    alignItems: "center",
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    margin: 20,
    marginBottom: 40,
    padding: 16,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    backgroundColor: "#F5F5F7",
    flex: 1,
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteText: {
    fontSize: 18,
  },
  emptyText: {
    color: "#8E8E93",
    fontSize: 16,
    paddingVertical: 60,
    textAlign: "center",
  },
  eventCard: {
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    flexDirection: "row",
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  eventDetail: {
    color: "#007AFF",
    fontSize: 14,
    marginBottom: 2,
  },
  eventIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventNotes: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 4,
  },
  eventTime: {
    color: "#8E8E93",
    fontSize: 14,
    marginBottom: 4,
  },
  eventType: {
    color: "#1C1C1E",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: "#1C1C1E",
    fontSize: 20,
    fontWeight: "600",
  },
  periodButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  periodButtonActive: {
    backgroundColor: "#007AFF",
  },
  periodButtonText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  periodSelector: {
    backgroundColor: "#fff",
    borderRadius: 12,
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 4,
  },
  refreshIcon: {
    fontSize: 20,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    color: "#8E8E93",
    fontSize: 12,
  },
  statValue: {
    color: "#1C1C1E",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-around",
    margin: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
