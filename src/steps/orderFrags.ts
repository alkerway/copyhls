import { Frag } from "../types/frag";
import { maxNetworkError } from "../utils/config" 
import Messages from "../utils/messages";


class OrderFrags {
    private lastProcessedFrag: Frag | null = null
    private unprocessedFrags: Frag[] = []
    private errorCount = 0

    public addToOrderedQueue = (frag: Frag): Frag[] => {
        console.log(`Frag ${frag.idx} added to ordering`)
        if (this.lastProcessedFrag === null) {
            if (frag.idx === 0) {
                this.lastProcessedFrag = frag
                if (frag.downloaded) {
                    return [frag]
                } else {
                    return []
                }
            } else {
                this.unprocessedFrags.push(frag)
                return []
            }
        }

        const fragsToSend = []
        this.unprocessedFrags.push(frag)
        this.unprocessedFrags.sort((a, b) => a.idx - b.idx)
        while (this.unprocessedFrags.length && this.unprocessedFrags[0].idx === this.lastProcessedFrag.idx + 1) {
            const newFrag = this.unprocessedFrags.shift() as Frag
            if (newFrag.downloaded) {
                fragsToSend.push(newFrag)
                this.errorCount = 0
            } else {
                this.errorCount++
                if (this.errorCount > maxNetworkError) {
                    console.log(`Max frags not downloaded, cancelling ticker`)
                    Messages.cancelTicker()
                }
            }
            this.lastProcessedFrag = Object.assign({}, newFrag)
        }
        return fragsToSend
    }
}

export default new OrderFrags