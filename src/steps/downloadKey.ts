import { catchError, tap, map, of } from "rxjs";
import { Frag } from "../types";
import { RemoteToFile } from "../utils/remoteToFile";


class DownloadKey {
    public download = (frag: Frag) => {
        if (frag.key) {
            return RemoteToFile(frag.key.remoteUrl, frag.key.storagePath)
                .pipe(
                    tap(() => console.log(`Downloaded Key for frag ${frag.idx}`)),
                    map(() => frag),
                    catchError((error: Error) => {
                        console.log(`Could not download key, ${error.message}`)
                        return of(frag)
                    })
                )
        } else {
            return of(frag)
        }
    }
}

export default new DownloadKey