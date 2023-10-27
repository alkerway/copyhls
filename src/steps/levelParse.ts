import { Frag, ExtKey, Level, InitSegment } from "../types";
import { storageBase } from "../utils/config";
import { Tags, getRemoteUrl, splitAttributes } from "../utils/manifest-utils";
import { extname } from "path";

class LevelParse {
  private levelCache: {
    [levelUrl: string]: {
      firstMediaSequence: null | number;
      keyMap: {
        [uri: string]: number;
      };
      keyIdx: number;
      initSegmentMap: {
        [uri: string]: number;
      };
      initSegmentIdx: number;
    };
  } = {};
  private instanceId = "";
  private loggedEndlist = false

  constructor() {
    this.instanceId = this.randId(3);
  }

  public getFragsFromManifest = ({
    levelText,
    level,
  }: {
    levelText: string;
    level: Level;
  }): { frags: Frag[]; hasEndlist: boolean } => {
    const frags: Frag[] = [];
    const lines = levelText.split("\n");
    let mediaSequence = 0;
    let curTagLines: string[] = [];
    let curFragDuration = 0;
    let curFragSequence = 0;
    let curExtKey: ExtKey | null = null;
    let curInitSegment: InitSegment | null = null;
    let hasEndlist = false;
    const levelUrl = level.remoteUrl;

    // set up cache
    if (!this.levelCache[levelUrl]) {
      this.levelCache[levelUrl] = {
        firstMediaSequence: null,
        keyMap: {},
        keyIdx: 0,
        initSegmentMap: {},
        initSegmentIdx: 0,
      };
    }

    for (const line of lines) {
      if (line.startsWith("##") || !line.trim()) {
        // line is comment
      } else if (line.startsWith("#")) {
        curTagLines.push(line);
        if (line.indexOf("EXTINF:") > -1) {
          const durationRegex = /EXTINF\:(.+),/;
          const match = durationRegex.exec(line);
          if (match && match[1]) {
            curFragDuration = Number(match[1]);
          } else {
            console.log("!! no frag duration extracted from extinf tag ", line);
          }
        }
        if (line.indexOf(Tags.MediaSequence) > -1) {
          const mediaSequenceRegex = /EXT-X-MEDIA-SEQUENCE\:(.+)(,|$)/;
          const match = mediaSequenceRegex.exec(line);
          if (match && match[1]) {
            mediaSequence = Number(match[1]);
            if (this.levelCache[levelUrl].firstMediaSequence === null) {
              this.levelCache[levelUrl].firstMediaSequence = mediaSequence;
            }
          }
        }
        if (line.indexOf(Tags.Key) > -1) {
          const commaRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
          const dataStr = line.split(/:(.+)/)[1];
          const dataParts = dataStr.split(commaRegex);
          const keyData = dataParts.reduce((keyObj, keyval) => {
            let [attr, val] = keyval.split(/=(.+)/);
            attr = attr.toLowerCase();
            if (attr === "method" || attr === "uri" || attr === "iv") {
              keyObj[attr] = val.replace(/['"]+/g, "");
            }
            return keyObj;
          }, {} as ExtKey);
          if (keyData.method?.toLowerCase() === "none") {
            curExtKey = null;
          } else if (
            keyData.method?.toLowerCase() === "aes-128" &&
            keyData.uri
          ) {
            if (keyData.uri.toLowerCase().startsWith("data")) {
              curExtKey = null;
            } else {
              const remoteKeyUrl = getRemoteUrl(keyData.uri, level.remoteUrl);
              keyData["remoteUrl"] = remoteKeyUrl;
              let keyStorageNumber = this.levelCache[levelUrl].keyIdx;
              if (this.levelCache[levelUrl].keyMap[remoteKeyUrl]) {
                keyStorageNumber =
                  this.levelCache[levelUrl].keyMap[remoteKeyUrl];
              } else {
                this.levelCache[levelUrl].keyIdx++;
                this.levelCache[levelUrl].keyMap[remoteKeyUrl] =
                  this.levelCache[levelUrl].keyIdx;
                keyStorageNumber = this.levelCache[levelUrl].keyIdx;
              }
              keyData[
                "storagePath"
              ] = `${storageBase}/keys/${this.instanceId}_key_${keyStorageNumber}.key`;
              keyData["localManifestLine"] = line.replace(
                keyData.uri,
                keyData.storagePath.slice(storageBase.length + 1)
              );
              curExtKey = keyData;
            }
          }
        }
        if (line.startsWith(Tags.Map)) {
          const mapAttributes = splitAttributes(
            line.slice(Tags.Map.length + 1)
          ).reduce((attributeList, attribute) => {
            const [key, val] = attribute.split(/=(.*)/);
            attributeList[key] = val.startsWith('"') ? val.slice(1, -1) : val;
            return attributeList;
          }, {} as Record<string, string>);
          const mapUri = mapAttributes["URI"];
          if (mapUri) {
            const initSegmentRemoteUrl = getRemoteUrl(mapUri, level.remoteUrl);
            const extName = extname(initSegmentRemoteUrl.split("?")[0]);

            let initSegmentCount = this.levelCache[levelUrl].initSegmentIdx;
            if (
              this.levelCache[levelUrl].initSegmentMap[initSegmentRemoteUrl]
            ) {
              initSegmentCount =
                this.levelCache[levelUrl].initSegmentMap[initSegmentRemoteUrl];
            } else {
              this.levelCache[levelUrl].initSegmentIdx++;
              this.levelCache[levelUrl].initSegmentMap[initSegmentRemoteUrl] =
                this.levelCache[levelUrl].initSegmentIdx;
              initSegmentCount = this.levelCache[levelUrl].initSegmentIdx;
            }

            const storagePath = `${level.localFragmentFolderPath}/${this.instanceId}_init_${initSegmentCount}${extName}`;
            curInitSegment = {
              remoteUrl: initSegmentRemoteUrl,
              storagePath,
              localManifestLine: line.replace(
                mapUri,
                storagePath.slice(storageBase.length + 1)
              ),
            };
          }
        }
        if (line.indexOf(Tags.End) > -1) {
          hasEndlist = true;
          const lastFrag = frags[frags.length - 1];
          if (lastFrag) {
            lastFrag.lastFragBeforeEndlist = true;
            if (!this.loggedEndlist) {
              console.log("ENDLIST frag encountered");
              this.loggedEndlist = true
            }
          }
        }
      } else {
        let remoteUrl = getRemoteUrl(line, level.remoteUrl);
        const extName = extname(remoteUrl.split("?")[0]);
        const fragIdx =
          curFragSequence +
          mediaSequence -
          (this.levelCache[levelUrl].firstMediaSequence || 0);
        let storagePath = `${this.instanceId}_frag_${fragIdx}${extName}`;
        const newFrag: Frag = {
          key: curExtKey,
          initSegment: curInitSegment,
          storagePath: `${level.localFragmentFolderPath}/${storagePath}`,
          remoteUrl,
          tagLines: curTagLines,
          downloaded: false,
          idx: fragIdx,
          originalMediaSequence: curFragSequence + mediaSequence,
          duration: curFragDuration,
          level,
          lastFragBeforeEndlist: false,
        };
        frags.push(newFrag);
        curTagLines = [];
        curFragDuration = 0;
        curFragSequence++;
      }
    }
    return {
      frags,
      hasEndlist,
    };
  };

  private randId = (length: number): string => {
    const alphabet = "qwertyuiopasdfghjklzxcvbnm";
    const letters = alphabet + alphabet.toUpperCase();
    let id = "";
    for (let i = 0; i < length; i++) {
      id = id + letters[Math.floor(Math.random() * letters.length)];
    }
    return id;
  };
}

export default new LevelParse();
