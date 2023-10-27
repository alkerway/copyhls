export type Level = {
  attributes: Record<string, string>;
  remoteUrl: string;
  originalTagLine?: string;
  originalTagUri?: string;
  type: "video" | "audio" | "subtitles";
  playlistLocalPath: string;
  localFragmentFolderPath: string;
};
