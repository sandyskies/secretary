import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { VoiceRecordButton } from "../components/VoiceRecordButton";
import { VoiceParser } from "../services/voiceParser";
import { EventStorage } from "../services/eventStorage";
import { ParsedEvent } from "../services/voiceParser";
import { EventType } from "../types/events";

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

export function VoiceInputScreen({ navigation }: any) {
  const [recordingText, setRecordingText] = useState("");
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
    setRecordingText("");
    setParsedEvent(null);
  };

  const handleDone = () => {
    navigation.navigate("Home");
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
          <Text style={styles.instruction}>长按下方按钮开始录音，松开停止</Text>

          <VoiceRecordButton onRecordingComplete={handleRecordingComplete} />

          {recordingText && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>识别结果</Text>
              <Text style={styles.resultText}>
                &ldquo;{recordingText}&rdquo;
              </Text>
            </View>
          )}

          {parsedEvent && (
            <View style={styles.parsedCard}>
              <Text style={styles.parsedLabel}>识别为</Text>
              <View style={styles.parsedEvent}>
                <Text style={styles.eventTag}>
                  #{EVENT_NAMES[parsedEvent.type]}
                </Text>
                {parsedEvent.feedingSide && (
                  <Text style={styles.sideTag}>
                    {parsedEvent.feedingSide === "left"
                      ? "左边"
                      : parsedEvent.feedingSide === "right"
                        ? "右边"
                        : "奶瓶"}
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
                <Text style={[styles.buttonText, styles.primaryButtonText]}>
                  完成
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>支持的语音指令</Text>
          <Text style={styles.tipItem}>
            🍼 &ldquo;宝宝喝奶左边&rdquo; / &ldquo;右侧喂奶&rdquo;
          </Text>
          <Text style={styles.tipItem}>
            🛁 &ldquo;洗个澡&rdquo; / &ldquo;沐浴&rdquo;
          </Text>
          <Text style={styles.tipItem}>
            💩 &ldquo;拉屎了&rdquo; / &ldquo;大便&rdquo;
          </Text>
          <Text style={styles.tipItem}>
            💧 &ldquo;拉尿&rdquo; / &ldquo;小便&rdquo;
          </Text>
          <Text style={styles.tipItem}>
            👶 &ldquo;换尿布&rdquo; / &ldquo;换纸尿裤&rdquo;
          </Text>
          <Text style={styles.tipItem}>
            😴 &ldquo;睡觉了&rdquo; / &ldquo;哄睡&rdquo;
          </Text>
          <Text style={styles.tipItem}>
            💊 &ldquo;吃药了&rdquo; / &ldquo;喂药&rdquo;
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    width: "100%",
  },
  backButton: {
    color: "#007AFF",
    fontSize: 32,
    width: 30,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    flex: 1,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#1C1C1E",
    fontSize: 16,
    fontWeight: "500",
  },
  container: {
    backgroundColor: "#F5F5F7",
    flex: 1,
  },
  content: {
    padding: 20,
  },
  eventTag: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  instruction: {
    color: "#8E8E93",
    fontSize: 16,
    marginBottom: 30,
  },
  parsedCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 3,
    marginTop: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "100%",
  },
  parsedEvent: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  parsedLabel: {
    color: "#8E8E93",
    fontSize: 14,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  primaryButtonText: {
    color: "#fff",
  },
  recordingSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 3,
    marginTop: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "100%",
  },
  resultLabel: {
    color: "#8E8E93",
    fontSize: 14,
    marginBottom: 8,
  },
  resultText: {
    color: "#1C1C1E",
    fontSize: 18,
    fontWeight: "500",
  },
  sideTag: {
    backgroundColor: "#E5F1FF",
    borderRadius: 8,
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  successText: {
    color: "#34C759",
    fontSize: 14,
    fontWeight: "600",
  },
  tipItem: {
    color: "#1C1C1E",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  tipsSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 3,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsTitle: {
    color: "#1C1C1E",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
});
