import fetch, { RequestInit } from "node-fetch";

import Messages from "../utils/messages";
import { initialUrl, referer, maxNetworkError } from "../utils/config";
import { catchError, defer, of, Observable, EMPTY } from "rxjs";
import { Tags, getRemoteUrl, splitAttributes } from "../utils/manifest-utils";
import { Level } from "../types";

class PrepareManifest {
  public parseManifest = ({
    manifestText,
    remoteUrl,
  }: {
    manifestText: string;
    remoteUrl: string;
  }): Level[] => {
    if (!manifestText.includes("EXTM3U")) {
      throw new Error("Manifest invalid");
    }

    const levels: Level[] = [];

    if (
      manifestText.indexOf(Tags.Inf) > 0 ||
      manifestText.indexOf(Tags.TargetDuration) > 0
    ) {
      // is level manifest, return
      return [
        {
          type: "video",
          remoteUrl,
        },
      ];
    }

    const manifestLines = manifestText.split("\n");

    manifestLines.forEach((line) => {
      if (!line.trim() || line.startsWith("##")) return;

      if (line.startsWith("#")) {
        if (line.startsWith(Tags.StreamInf)) {
          const videoAttributes = splitAttributes(
            line.slice(Tags.StreamInf.length + 1)
          ).reduce((attributeList, attribute) => {
            const [key, val] = attribute.split(/=(.*)/);
            switch (key) {
              case "BANDWIDTH":
                attributeList["bitrate"] = val;
                break;
              case "RESOLUTION":
                attributeList["width"] = val.split("x")[0];
                attributeList["height"] = val.split("x")[1];
                break;
              default:
                attributeList[key] = val.startsWith('"')
                  ? val.slice(1, -1)
                  : val;
                break;
            }
            return attributeList;
          }, {} as Record<string, string>);
          levels.push({
            remoteUrl: "",
            originalTagLine: line,
            type: "video",
            attributes: videoAttributes,
          });
        } else if (line.startsWith(Tags.Media)) {
          const mediaAttributes = splitAttributes(
            line.slice(Tags.Media.length + 1)
          ).reduce((attributeList, attribute) => {
            const [key, val] = attribute.split(/=(.*)/);
            attributeList[key] = val.startsWith('"') ? val.slice(1, -1) : val;
            return attributeList;
          }, {} as Record<string, string>);
          if (
            mediaAttributes["TYPE"] !== "AUDIO" &&
            mediaAttributes["TYPE"] !== "SUBTITLES"
          ) {
            console.warn("unknown media in master manifest", mediaAttributes);
          }
          levels.push({
            remoteUrl: getRemoteUrl(mediaAttributes["URI"], initialUrl),
            originalTagLine: line,
            type: mediaAttributes["TYPE"].toLowerCase() as
              | "audio"
              | "subtitles",
            attributes: mediaAttributes,
          });
        }
      } else {
        // last level is corresponding video level
        levels[levels.length - 1].remoteUrl = getRemoteUrl(line, initialUrl);
      }
    });

    return levels;
  };

  selectLevels = (allLevels: Level[]): Level[] => {
    const selectMode = "oneOfEach";

    const firstVideoLevel = allLevels.find((l) => l.type === "video");
    if (!firstVideoLevel) return allLevels;

    let audioLevel;
    const audioGroup = firstVideoLevel?.attributes?.["AUDIO"];
    if (audioGroup) {
      const audioLevels = allLevels.filter(
        (level) =>
          level.type === "audio" &&
          level.attributes?.["GROUP-ID"] === audioGroup
      );
      const bestAudioLevel = audioLevels.find((level) =>
        level?.attributes?.["DEFAULT"]?.includes("YES")
      );
      audioLevel = bestAudioLevel || audioLevels[0];
    }
    let subtitlesLevel;
    const subtitlesGroup = firstVideoLevel?.attributes?.["SUBTITLES"];
    if (subtitlesGroup) {
      const subtitlesLevels = allLevels.filter(
        (level) =>
          level.type === "subtitles" &&
          level.attributes?.["GROUP-ID"] === subtitlesGroup
      );
      const bestLevel = subtitlesLevels.find((level) =>
        level?.attributes?.["DEFAULT"]?.includes("YES")
      );
      subtitlesLevel = bestLevel || subtitlesLevels[0];
    }

    const levelsToSelect = [firstVideoLevel];
    if (audioLevel) levelsToSelect.push(audioLevel);
    if (subtitlesLevel) levelsToSelect.push(subtitlesLevel);

    return levelsToSelect;
  };
}

export default new PrepareManifest();
