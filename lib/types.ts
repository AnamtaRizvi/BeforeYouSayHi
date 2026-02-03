export type VoiceProfileJson = {
  tone?: string;
  emojiUsage?: string;
  verbosity?: string;
  catchphrases?: string[];
  sampleReplies?: string[];
  personality?: string;
};

export type ConvoCalibrationEntry = { prompt: string; reply: string };
export type ScenarioReplyEntry = {
  scenario: string;
  options: string[];
  chosen: string;
};

export type AvatarSetupAnswers = Record<string, string>;
