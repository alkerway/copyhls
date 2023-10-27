import { initialUrl, storageBase } from "../utils/config";
import { Tags, getRemoteUrl, splitAttributes } from "../utils/manifest-utils";
import { Level } from "../types";
import { writeFile } from "fs-extra";

class PrepareManifest {
  private masterText = "";
  private keepLevels: Level[] = [];

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
    let videoLevelIndex = 0;

    if (
      manifestText.indexOf(Tags.Inf) > 0 ||
      manifestText.indexOf(Tags.TargetDuration) > 0
    ) {
      // is level manifest, return
      return [
        {
          type: "video",
          remoteUrl,
          playlistLocalPath: "level.m3u8",
          localFragmentFolderPath: "frags",
          attributes: {},
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
            playlistLocalPath: "",
            localFragmentFolderPath: "",
          });
          videoLevelIndex++;
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
            originalTagUri: mediaAttributes["URI"],
            type: mediaAttributes["TYPE"].toLowerCase() as
              | "audio"
              | "subtitles",
            attributes: mediaAttributes,
            playlistLocalPath: "",
            localFragmentFolderPath: "",
          });
        }
      } else {
        // last level is corresponding video level
        levels[levels.length - 1].remoteUrl = getRemoteUrl(line, initialUrl);
      }
    });

    this.masterText = manifestText;

    return levels;
  };

  prepareLevels = (allLevels: Level[]): Level[] => {
    // select one of each

    const firstVideoLevel = allLevels.find((l) => l.type === "video");
    // if (!firstVideoLevel) {
    const editedLevels = allLevels.map((level, idx) => {
      return {
        ...level,
        localFragmentFolderPath: `${storageBase}/${level.type}_${idx}`,
        playlistLocalPath: `${storageBase}/playlist_${level.type}_${idx}.m3u8`,
      };
    });
    this.keepLevels = editedLevels;
    return editedLevels;
    // }

    // let audioLevel;
    // const audioGroup = firstVideoLevel?.attributes?.["AUDIO"];
    // if (audioGroup) {
    //   const audioLevels = allLevels.filter(
    //     (level) =>
    //       level.type === "audio" &&
    //       level.attributes?.["GROUP-ID"] === audioGroup
    //   );
    //   const bestAudioLevel = audioLevels.find((level) =>
    //     level?.attributes?.["DEFAULT"]?.includes("YES")
    //   );
    //   audioLevel = bestAudioLevel || audioLevels[0];
    // }
    // let subtitlesLevel;
    // const subtitlesGroup = firstVideoLevel?.attributes?.["SUBTITLES"];
    // if (subtitlesGroup) {
    //   const subtitlesLevels = allLevels.filter(
    //     (level) =>
    //       level.type === "subtitles" &&
    //       level.attributes?.["GROUP-ID"] === subtitlesGroup
    //   );
    //   const bestLevel = subtitlesLevels.find((level) =>
    //     level?.attributes?.["DEFAULT"]?.includes("YES")
    //   );
    //   subtitlesLevel = bestLevel || subtitlesLevels[0];
    // }

    // const levelsToSelect = [firstVideoLevel];
    // if (!audioLevel && !subtitlesLevel) {
    //   firstVideoLevel.localFragmentFolderPath = `${storageBase}/frags`;
    //   firstVideoLevel.playlistLocalPath = `${storageBase}/level.m3u8`;
    // } else {
    //   firstVideoLevel.localFragmentFolderPath = `${storageBase}/video_0`;
    //   firstVideoLevel.playlistLocalPath = `${storageBase}/playlist_video_0.m3u8`;
    // }

    // if (audioLevel) {
    //   audioLevel.localFragmentFolderPath = `${storageBase}/audio_${audioLevel.attributes["NAME"]}`;
    //   audioLevel.playlistLocalPath = `${storageBase}/playlist_audio_${audioLevel.attributes["NAME"]}.m3u8`;
    //   levelsToSelect.push(audioLevel);
    // }
    // if (subtitlesLevel) {
    //   subtitlesLevel.localFragmentFolderPath = `${storageBase}/subtitles_${subtitlesLevel.attributes["NAME"]}`;
    //   subtitlesLevel.playlistLocalPath = `${storageBase}/playlist_subtitles_${subtitlesLevel.attributes["NAME"]}.m3u8`;
    //   levelsToSelect.push(subtitlesLevel);
    // }
    // this.keepLevels = levelsToSelect;
    // return levelsToSelect;
  };

  generateEditedMaster = () => {
    // :( use stored state in this class cause we can't think of a better way
    // to write the master manifest after levels + frags complete

    const manifestText = this.masterText;
    const levelsToSelect = this.keepLevels;
    const editedManifest = manifestText
      .split("\n")
      .reduce((manifestLines, line) => {
        if (line.trim() && !line.startsWith("#")) {
          // remove all urls. If we have a
          return manifestLines;
        }
        const matchingLevel = levelsToSelect.find(
          (level) => level.originalTagLine === line
        );
        if (matchingLevel && matchingLevel.originalTagUri) {
          if (line.startsWith(Tags.Media)) {
            manifestLines.push(
              line.replace(
                matchingLevel.originalTagUri,
                matchingLevel.playlistLocalPath.slice(storageBase.length + 1)
              )
            );
            return manifestLines;
          }
        }

        if (matchingLevel && line.startsWith(Tags.StreamInf)) {
          manifestLines.push(line);
          manifestLines.push(
            matchingLevel.playlistLocalPath.slice(storageBase.length + 1)
          );
          return manifestLines;
        }

        if (
          (line.startsWith(Tags.Media) || line.startsWith(Tags.StreamInf)) &&
          !matchingLevel
        ) {
          return manifestLines;
        }

        manifestLines.push(line);
        return manifestLines;
      }, [] as string[])
      .join("\n");

    return editedManifest;
  };
}

export default new PrepareManifest();
