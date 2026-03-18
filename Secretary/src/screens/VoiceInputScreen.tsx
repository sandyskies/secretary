import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VoiceRecordButton } from '../components/VoiceRecordButton';
import { VoiceParser } from '../services/voiceParser';
import { EventStorage } from '../services/eventStorage';
import { ParsedEvent } from '../services/voiceParser';
import { EventType } from '../types/events';

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

export function VoiceInputScreen({ navigation }: any) {
  const [recordingText, setRecordingText] = useState('');
  const [parsedEvent, setParsedEvent] = useState<ParsedEvent | null>(null);

  const handleRecordingComplete = async (text: string) => {
    setRecordingText(text);
    const parsed = VoiceParser.parse(text);
    setParsedEvent(parsed);

    // Auto-save the event
    if (parsed) {
      await EventStorage.saveEvent({
        id: Date.now().toString(),
        type: parsed.type,
        timestamp: new Date(),
        notes: parsed.notes,
        feedingSide: parsed.feedingSide,
        createdAt: new Date(),
      });
    }
  };

  const handleSaveAnother = () => {
    setRecordingText('');
    setParsedEvent(null);
  };

  const handleDone = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>语音记录</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.recordingSection}>
          <Text style={styles.instruction}>
            长按下方按钮开始录音，松开停止
          </Text>

          <VoiceRecordButton onRecordingComplete={handleRecordingComplete} />

          {recordingText && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>识别结果</Text>
              <Text style={styles.resultText}>"{recordingText}"</Text>
            </View>
          )}

          {parsedEvent && (
            <View style={styles.parsedCard}>
              <Text style={styles.parsedLabel}>识别为</Text>
              <View style={styles.parsedEvent}>
                <Text style={styles.eventTag}>#{EVENT_NAMES[parsedEvent.type]}</Text>
                {parsedEvent.feedingSide && (
                  <Text style={styles.sideTag}>
                    {parsedEvent.feedingSide === 'left' ? '左边' : parsedEvent.feedingSide === 'right' ? '右边' : '奶瓶'}
                  </Text>
                )}
                <Text style={styles.successText}>✓ 已保存</Text>
              </View>
            </View>
          )}

          {recordingText && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSaveAnother}
              >
                <Text style={styles.buttonText}>再记录一条</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleDone}
              >
                <Text style={[styles.buttonText, styles.primaryButtonText]}>完成</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>支持的语音指令</Text>
          <Text style={styles.tipItem}>🍼 "宝宝喝奶左边" / "右侧喂奶"</Text>
          <Text style={styles.tipItem}>🛁 "洗个澡" / "沐浴"</Text>
          <Text style={styles.tipItem}>💩 "拉屎了" / "大便"</Text>
          <Text style={styles.tipItem}>💧 "拉尿" / "小便"</Text>
          <Text style={styles.tipItem}>👶 "换尿布" / "换纸尿裤"</Text>
          <Text style={styles.tipItem}>😴 "睡觉了" / "哄睡"</Text>
          <Text style={styles.tipItem}>💊 "吃药了" / "喂药"</Text>
        </View>
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
  backButton: {
    fontSize: 32,
    color: '#007AFF',
    width: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  content: {
    padding: 20,
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instruction: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 30,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 18,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  parsedCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  parsedLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  parsedEvent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  eventTag: {
    backgroundColor: '#007AFF',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  sideTag: {
    backgroundColor: '#E5F1FF',
    color: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  successText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  primaryButtonText: {
    color: '#fff',
  },
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  tipItem: {
    fontSize: 15,
    color: '#1C1C1E',
    marginBottom: 12,
    lineHeight: 22,
  },
});
