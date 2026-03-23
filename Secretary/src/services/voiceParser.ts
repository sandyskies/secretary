import { EventType, FeedingSide } from "../types/events";

export interface ParsedEvent {
  type: EventType;
  feedingSide?: FeedingSide;
  notes?: string;
}

export class VoiceParser {
  /**
   * Parse voice text to extract event information
   * This is a local parser that can be enhanced with trpc-agent-go API later
   */
  static parse(text: string): ParsedEvent | null {
    const lowerText = text.toLowerCase().trim();

    // Feeding related
    if (this.containsKeywords(lowerText, ["喝奶", "喂奶", "吃奶"])) {
      const side = this.extractFeedingSide(lowerText);
      return {
        type: "feeding",
        feedingSide: side,
        notes: text,
      };
    }

    // Bath
    if (this.containsKeywords(lowerText, ["洗澡", "沐浴"])) {
      return {
        type: "bath",
        notes: text,
      };
    }

    // Poop
    if (this.containsKeywords(lowerText, ["拉屎", "大便", "排便"])) {
      return {
        type: "poop",
        notes: text,
      };
    }

    // Pee
    if (this.containsKeywords(lowerText, ["拉尿", "小便", "尿尿"])) {
      return {
        type: "pee",
        notes: text,
      };
    }

    // Diaper change
    if (this.containsKeywords(lowerText, ["换尿布", "换尿不湿", "换纸尿裤"])) {
      return {
        type: "diaperChange",
        notes: text,
      };
    }

    // Sleep
    if (this.containsKeywords(lowerText, ["睡觉", "睡觉觉", "睡了"])) {
      return {
        type: "sleep",
        notes: text,
      };
    }

    // Medication
    if (this.containsKeywords(lowerText, ["吃药", "喂药"])) {
      return {
        type: "medication",
        notes: text,
      };
    }

    // Default to note
    if (text.length > 0) {
      return {
        type: "note",
        notes: text,
      };
    }

    return null;
  }

  private static containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }

  private static extractFeedingSide(text: string): FeedingSide | undefined {
    if (text.includes("左") && text.includes("右")) {
      return "bottle"; // Both sides mentioned, assume bottle
    }
    if (text.includes("左")) {
      return "left";
    }
    if (text.includes("右")) {
      return "right";
    }
    return undefined;
  }

  /**
   * Parse using trpc-agent-go API (to be implemented)
   */
  static async parseWithAgent(
    text: string,
    _apiKey?: string,
  ): Promise<ParsedEvent | null> {
    // TODO: Integrate with trpc-agent-go API
    // https://github.com/trpc-group/trpc-agent-go
    return this.parse(text);
  }
}
