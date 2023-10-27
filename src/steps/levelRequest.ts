import fetch from "node-fetch";

import Messages from "../utils/messages";
import { referer, maxNetworkError } from "../utils/config";
import { catchError, defer, EMPTY, Observable } from "rxjs";
import { Level } from "../types";

class LevelRequest {
  private errorCount = 0;

  public requestLevel = (
    level: Level
  ): Observable<{ level: Level; levelText: string }> => {
    const remoteUrl = level.remoteUrl;
    const options: any = {
      headers: {
        referer: referer,
        origin: referer,
        "user-agent": "foxtel_stb",
      },
    };
    return defer(async () => {
      const res = await fetch(remoteUrl, options);
      if (!res.ok) {
        throw new Error(
          `Error retrieving level: ${res.status}, ${res.statusText}`
        );
      }
      this.errorCount = 0;
      const levelText = await res.text();
      return {
        level,
        levelText,
      };
    }).pipe(catchError(this.onLevelError));
  };

  public onLevelError = (error: Error) => {
    this.errorCount++;
    console.log(error.message);
    if (this.errorCount > maxNetworkError) {
      console.log(`Max level request error, cancelling ticker`);
      Messages.cancelTicker();
    }
    return EMPTY;
  };
}

export default new LevelRequest();
