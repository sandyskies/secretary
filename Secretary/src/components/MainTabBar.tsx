import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";

interface MainTabBarProps {
  onHomePress: () => void;
  onVoicePress: () => void;
  onEventsPress: () => void;
  onCalendarPress: () => void;
  activeTab: string;
}

type StyleArray = (ViewStyle | TextStyle)[];

export function MainTabBar({
  onHomePress,
  onVoicePress,
  onEventsPress,
  onCalendarPress,
  activeTab,
}: MainTabBarProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={
          [styles.tab, activeTab === "home" && styles.tabActive] as StyleArray
        }
        onPress={onHomePress}
      >
        <Text
          style={
            [
              styles.tabIcon,
              activeTab === "home" && styles.tabIconActive,
            ] as StyleArray
          }
        >
          {activeTab === "home" ? "🏠" : "🏠"}
        </Text>
        <Text
          style={
            [
              styles.tabLabel,
              activeTab === "home" && styles.tabLabelActive,
            ] as StyleArray
          }
        >
          首页
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          [styles.tab, activeTab === "events" && styles.tabActive] as StyleArray
        }
        onPress={onEventsPress}
      >
        <Text
          style={
            [
              styles.tabIcon,
              activeTab === "events" && styles.tabIconActive,
            ] as StyleArray
          }
        >
          📋
        </Text>
        <Text
          style={
            [
              styles.tabLabel,
              activeTab === "events" && styles.tabLabelActive,
            ] as StyleArray
          }
        >
          记录
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.voiceTab} onPress={onVoicePress}>
        <View style={styles.voiceButton}>
          <Text style={styles.voiceIcon}>🎙️</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          [
            styles.tab,
            activeTab === "calendar" && styles.tabActive,
          ] as StyleArray
        }
        onPress={onCalendarPress}
      >
        <Text
          style={
            [
              styles.tabIcon,
              activeTab === "calendar" && styles.tabIconActive,
            ] as StyleArray
          }
        >
          📅
        </Text>
        <Text
          style={
            [
              styles.tabLabel,
              activeTab === "calendar" && styles.tabLabelActive,
            ] as StyleArray
          }
        >
          日历
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={
          [
            styles.tab,
            activeTab === "profile" && styles.tabActive,
          ] as StyleArray
        }
      >
        <Text
          style={
            [
              styles.tabIcon,
              activeTab === "profile" && styles.tabIconActive,
            ] as StyleArray
          }
        >
          🧸
        </Text>
        <Text
          style={
            [
              styles.tabLabel,
              activeTab === "profile" && styles.tabLabelActive,
            ] as StyleArray
          }
        >
          我的
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderTopColor: "#E5E5E5",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tab: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 4,
  },
  tabActive: {},
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    color: "#8E8E93",
    fontSize: 11,
  },
  tabLabelActive: {
    color: "#007AFF",
    fontWeight: "500",
  },
  voiceButton: {
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 28,
    elevation: 8,
    height: 56,
    justifyContent: "center",
    marginTop: -28,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 56,
  },
  voiceIcon: {
    fontSize: 28,
  },
  voiceTab: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
