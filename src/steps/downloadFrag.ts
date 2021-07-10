import { Frag } from "../types/frag";
import { mergeMap, defer, Observable, retryWhen, timer, throwError, catchError, of, map } from "rxjs";
import { RemoteToFile } from "../utils/remoteToFile";

const FRAG_TIMEOUT = 20

class DownloadFrag {
    private maxRetry = 3

    public download = (frag: Frag): Observable<Frag> => {
        const {remoteUrl, storagePath} = frag
        const basePath = frag.storagePath.split('/').slice(0, -1).join('/')
        console.log(`Starting download ${frag.idx}`)
        return RemoteToFile(remoteUrl, storagePath, FRAG_TIMEOUT)
            .pipe(
                map(() => {
                    console.log(`Finished download ${frag.idx}`)
                    frag.downloaded = true
                    return frag
                }),
                retryWhen(errors => {
                    return errors.pipe(
                        mergeMap((error, attemptNo) => {
                            console.log(`Frag download error, ${error}`)
                            if (attemptNo + 1 > this.maxRetry) {
                                return throwError(() => error)
                            }
                            return timer(1000)
                        })
                    )
                }),
                catchError((error) => {
                    console.log(`Max retry exceeded, frag ${frag.idx} ${frag.storagePath}, error ${error}`)
                    return of(frag)
                })
            )

    }
}

export default new DownloadFrag