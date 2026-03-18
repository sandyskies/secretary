import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface MainTabBarProps {
  onHomePress: () => void;
  onVoicePress: () => void;
  onEventsPress: () => void;
  onCalendarPress: () => void;
  activeTab: string;
}

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
        style={([styles.tab, activeTab === 'home' && styles.tabActive] as any)}
        onPress={onHomePress}
      >
        <Text style={([styles.tabIcon, activeTab === 'home' && styles.tabIconActive] as any)}>
          {activeTab === 'home' ? '🏠' : '🏠'}
        </Text>
        <Text style={([styles.tabLabel, activeTab === 'home' && styles.tabLabelActive] as any)}>
          首页
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={([styles.tab, activeTab === 'events' && styles.tabActive] as any)}
        onPress={onEventsPress}
      >
        <Text style={([styles.tabIcon, activeTab === 'events' && styles.tabIconActive] as any)}>
          📋
        </Text>
        <Text style={([styles.tabLabel, activeTab === 'events' && styles.tabLabelActive] as any)}>
          记录
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.voiceTab}
        onPress={onVoicePress}
      >
        <View style={styles.voiceButton}>
          <Text style={styles.voiceIcon}>🎙️</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={([styles.tab, activeTab === 'calendar' && styles.tabActive] as any)}
        onPress={onCalendarPress}
      >
        <Text style={([styles.tabIcon, activeTab === 'calendar' && styles.tabIconActive] as any)}>
          📅
        </Text>
        <Text style={([styles.tabLabel, activeTab === 'calendar' && styles.tabLabelActive] as any)}>
          日历
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={([styles.tab, activeTab === 'profile' && styles.tabActive] as any)}
      >
        <Text style={([styles.tabIcon, activeTab === 'profile' && styles.tabIconActive] as any)}>
          🧸
        </Text>
        <Text style={([styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive] as any)}>
          我的
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
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
    fontSize: 11,
    color: '#8E8E93',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  voiceTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  voiceIcon: {
    fontSize: 28,
  },
});
