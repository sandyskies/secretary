import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export class VoiceService {
  private recording: Audio.Recording | null = null;

  async setupAudio(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  }

  async startRecording(): Promise<void> {
    await this.setupAudio();
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to record audio not granted");
    }

    this.recording = new Audio.Recording();
    try {
      await this.recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await this.recording.startAsync();
    } catch (error) {
      console.error("Failed to start recording:", error);
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    if (!this.recording) {
      throw new Error("No recording in progress");
    }

    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    this.recording = null;

    if (!uri) {
      throw new Error("Recording failed to save");
    }

    // Read audio file and convert to base64 for API
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    // Clean up the temp file
    await FileSystem.deleteAsync(uri);

    return base64;
  }

  async getRecordingStatus(): Promise<Audio.RecordingStatus | null> {
    if (!this.recording) return null;
    return await this.recording.getStatusAsync();
  }

  isRecording(): boolean {
    return this.recording !== null;
  }
}
