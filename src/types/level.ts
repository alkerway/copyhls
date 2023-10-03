export type Level = {
  attributes?: Record<string, string>;
  remoteUrl: string;
  originalTagLine?: string;
  type: "video" | "audio" | "subtitles";
};
