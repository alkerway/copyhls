import { ExtKey } from "./key";
import { Level } from "./level";

export interface InitSegment {
  remoteUrl: string;
  storagePath: string;
  localManifestLine: string;
}

export interface Frag {
  remoteUrl: string;
  storagePath: string;
  tagLines: string[];
  duration: number;
  idx: number;
  originalMediaSequence: number;
  downloaded: boolean;
  key: ExtKey | null;
  level: Level;
  initSegment: InitSegment | null;
  lastFragBeforeEndlist: boolean;
}
