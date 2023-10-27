import { catchError, tap, map, of } from "rxjs";
import { Frag } from "../types";
import { RemoteToFile } from "../utils/remoteToFile";

class DownloadInitSegment {
  private pendingInitPaths: string[] = [];
  private downloadedInitSegments: string[] = [];
  public download = (frag: Frag) => {
    if (
      frag.initSegment &&
      !this.pendingInitPaths.includes(frag.initSegment.storagePath) &&
      !this.downloadedInitSegments.includes(frag.initSegment.storagePath)
    ) {
      this.pendingInitPaths.push(frag.initSegment.storagePath);
      return RemoteToFile(
        frag.initSegment.remoteUrl,
        frag.initSegment.storagePath
      ).pipe(
        tap(() => {
          console.log(`Downloaded InitSegment for frag ${frag.idx}`);
          this.downloadedInitSegments.push(frag.initSegment?.storagePath || "");
          this.pendingInitPaths = this.pendingInitPaths.filter(
            (initPath) => initPath !== frag.initSegment?.storagePath
          );
        }),
        map(() => frag),
        catchError((error: Error) => {
          console.log(`Could not download init segment, ${error.message}`);
          return of(frag);
        })
      );
    } else {
      return of(frag);
    }
  };
}

export default new DownloadInitSegment();
