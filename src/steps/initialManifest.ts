import fetch, { RequestInit } from "node-fetch";

import Messages from "../utils/messages";
import { referer, maxNetworkError } from "../utils/config";
import { catchError, defer, EMPTY, Observable } from "rxjs";

class InitialManifest {
  private errorCount = 0;

  public getInitialManifest = (
    initialUrl: string
  ): Observable<{
    manifestText: string;
    remoteUrl: string;
  }> => {
    const options: any = {
      headers: {
        referer: referer,
        origin: referer,
        "user-agent": "foxtel_stb",
      },
    };
    return defer(async () => {
      const res = await fetch(initialUrl, options);
      if (!res.ok) {
        throw new Error(
          `Error retrieving level: ${res.status}, ${res.statusText}`
        );
      }
      this.errorCount = 0;
      const manifestText = await res.text();
      // console.log(manifestText);
      return {
        manifestText,
        remoteUrl: initialUrl,
      };
    }).pipe(catchError(this.onRequestError));
  };

  public onRequestError = (error: Error) => {
    this.errorCount++;
    console.log(error.message);
    if (this.errorCount > maxNetworkError) {
      console.log(`Max master request error, cancelling ticker`);
      Messages.cancelTicker();
    }
    return EMPTY;
  };
}

export default new InitialManifest();
