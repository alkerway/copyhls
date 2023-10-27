import { Frag } from "../types/frag";

import { appendFile, writeFile } from "fs-extra";
import { Tags } from "../utils/manifest-utils";
import PrepareManifest from "./prepareManifest";
import { storageBase } from "../utils/config";

class WriteToManifest {
  private levelCache: {
    [levelUrl: string]: { hasWittenAlready: boolean; totalDuration: 0 };
  } = {};
  private hasWrittenMaster = false;

  public write = async (frag: Frag): Promise<Frag> => {
    const levelUrl = frag.level.remoteUrl;

    const levelPath = frag.level.playlistLocalPath;

    if (!this.levelCache[levelUrl]) {
      this.levelCache[levelUrl] = { hasWittenAlready: true, totalDuration: 0 };
      await writeFile(levelPath, "");
    }

    if (frag.key) {
      const originalKeyLine = frag.tagLines.find((line) =>
        line.includes(Tags.Key)
      );
      if (originalKeyLine) {
        const originalIdx = frag.tagLines.indexOf(originalKeyLine);
        frag.tagLines[originalIdx] = frag.key.localManifestLine;
      }
    }

    if (frag.initSegment) {
      const originalInitSegLine = frag.tagLines.find((line) =>
        line.includes(Tags.Map)
      );
      if (originalInitSegLine) {
        const originalIdx = frag.tagLines.indexOf(originalInitSegLine);
        frag.tagLines[originalIdx] = frag.initSegment.localManifestLine;
      }
    }

    const text = `${frag.tagLines.join("\n")}\n${frag.storagePath
      .split("/")
      .slice(1)
      .join("/")}\n`;
    await appendFile(levelPath, text);
    this.levelCache[levelUrl].totalDuration += frag.duration;
    console.log(
      `Frag ${frag.idx} written to ${frag.storagePath} (${(
        this.levelCache[levelUrl].totalDuration / 60
      ).toFixed(1)}min)`
    );

    if (frag.lastFragBeforeEndlist) {
      await appendFile(levelPath, Tags.End + "\n");
    }

    if (!this.hasWrittenMaster) {
      const editedManifest = await PrepareManifest.generateEditedMaster();
      await writeFile(`${storageBase}/master.m3u8`, editedManifest);
      this.hasWrittenMaster = true;
    }

    return frag;
  };
}

export default new WriteToManifest();
