import { pathExists, appendFile } from "fs-extra";
import { exec } from "child_process";
import { promisify } from "util";

const promiseExec = promisify(exec);

import { storageBase, outputFormat } from "../utils/config";

class Finished {
  public assembleVideo = async () => {
    console.log("Compiling video...");
    const stamp = new Date()
      .toLocaleTimeString()
      .slice(0, 7)
      .replace(/:/g, "-");
    // await promiseExec(`ffmpeg -y -allowed_extensions ALL -i ${levelPath} -c copy ${storageBase}/video_${stamp}.${outputFormat}`)
    console.log("Done");
  };
}

export default new Finished();
