import { existsSync } from "fs-extra";
import { catchError, tap, map, of } from "rxjs";
import { Frag } from "../types";
import { RemoteToFile } from "../utils/remoteToFile";

class DownloadKey {
  private pendingKeyPaths: string[] = [];
  private downloadedKeys: string[] = [];
  public download = (frag: Frag) => {
    if (
      frag.key &&
      !this.pendingKeyPaths.includes(frag.key.storagePath) &&
      !this.downloadedKeys.includes(frag.key.storagePath)
    ) {
      this.pendingKeyPaths.push(frag.key.storagePath);
      return RemoteToFile(frag.key.remoteUrl, frag.key.storagePath).pipe(
        tap(() => {
          console.log(`Downloaded Key for frag ${frag.idx}`);
          this.downloadedKeys.push(frag.key?.storagePath || "");
          this.pendingKeyPaths = this.pendingKeyPaths.filter(
            (keyPath) => keyPath !== frag.key?.storagePath
          );
        }),
        map(() => frag),
        catchError((error: Error) => {
          console.log(`Could not download key, ${error.message}`);
          return of(frag);
        })
      );
    } else {
      return of(frag);
    }
  };
}

export default new DownloadKey();
