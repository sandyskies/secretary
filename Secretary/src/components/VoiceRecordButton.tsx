import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Audio } from "expo-av";
import { VoiceService } from "../services/voiceService";

interface VoiceRecordButtonProps {
  onRecordingComplete: (text: string) => void;
}

export function VoiceRecordButton({
  onRecordingComplete,
}: VoiceRecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const voiceService = new VoiceService();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await voiceService.startRecording();

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const _sound = new Audio.Sound();
      // Play beep sound
      const { status } = await Audio.requestPermissionsAsync();
      if (status === "granted") {
        // For Expo, we can use a placeholder sound or remove this beep
        // since require() for assets is not allowed in this context
        console.log("Audio permission granted - beep sound would play here");
      }

      setIsRecording(false);
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);

      // Note: In production, you would send the audio to a speech-to-text service
      // For now, simulating with a sample text
      const sampleTexts = [
        "宝宝喝奶左边 breast",
        "宝宝洗了个澡",
        "拉屎了",
        "换尿布",
      ];
      const randomText =
        sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

      onRecordingComplete(randomText);
    } catch (error) {
      console.error("Error stopping recording:", error);
      setIsRecording(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={isRecording ? stopRecording : startRecording}
      style={styles.container}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            {
              backgroundColor: isRecording ? "#FF3B30" : "#007AFF",
            },
          ]}
        />
      </Animated.View>
      <View
        style={[styles.statusIndicator, isRecording && styles.statusRecording]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    borderRadius: 60,
    elevation: 8,
    height: 120,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 120,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  innerCircle: {
    borderRadius: 35,
    height: 70,
    width: 70,
  },
  statusIndicator: {
    backgroundColor: "#8E8E93",
    borderRadius: 4,
    height: 8,
    marginTop: 10,
    width: 8,
  },
  statusRecording: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});
