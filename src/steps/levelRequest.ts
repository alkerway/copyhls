import fetch, { RequestInit } from "node-fetch";

import Messages from "../utils/messages";
import { levelUrl, referer, maxNetworkError } from "../utils/config" 
import { catchError, EMPTY, from, Observable } from "rxjs";

class LevelRequest {
    private errorCount = 0


    public requestLevel = (): Observable<string> => {
        const options: RequestInit = {
            headers: {
                referer: referer,
                origin: referer
            }
        }
        return from(fetch(levelUrl, options)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error retrieving level: ${res.status}, ${res.statusText}`)
                }
                this.errorCount = 0
                return res.text()
            }))
            .pipe(catchError(this.onLevelError))
    }

    public onLevelError = (error: Error) => {
        this.errorCount++
        console.log(error.message)
        if (this.errorCount > maxNetworkError) {
            console.log(`Max level request error, cancelling ticker`)
            Messages.cancelTicker()
        }
        return EMPTY
    }
}

export default new LevelRequest