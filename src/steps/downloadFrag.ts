import { Frag } from "../types/frag";
import {
  mergeMap,
  Observable,
  retryWhen,
  timer,
  throwError,
  catchError,
  of,
  map,
} from "rxjs";
import { RemoteToFile } from "../utils/remoteToFile";

const FRAG_TIMEOUT = 15;

class DownloadFrag {
  private maxRetry = 3;

  public download = (frag: Frag): Observable<Frag> => {
    const { remoteUrl, storagePath } = frag;
    console.log(`Starting download ${frag.level.type} ${frag.idx}`);
    return RemoteToFile(remoteUrl, storagePath, FRAG_TIMEOUT).pipe(
      map(() => {
        console.log(`Frag ${frag.level.type} ${frag.idx} downloaded`);
        frag.downloaded = true;
        return frag;
      }),
      retryWhen((errors) => {
        return errors.pipe(
          mergeMap((error, attemptNo) => {
            console.log(`Frag download error, ${error}, retrying in 3 sec`);
            if (attemptNo + 1 > this.maxRetry) {
              return throwError(() => error);
            }
            return timer(3000);
          })
        );
      }),
      catchError((error) => {
        console.log(
          `Max retry exceeded, frag ${frag.idx} ${frag.storagePath}, error ${error}`
        );
        return of(frag);
      })
    );
  };
}

export default new DownloadFrag();
