import { Frag } from "../types/frag";
import { maxNetworkError } from "../utils/config" 
import FragQueue from "../utils/fragQueue";
import Messages from "../utils/messages";


class OrganizeFrags {
    private unprocessedFrags: Frag[] = []
    private errorCount = 0
    private lastProcessedIdx = 0

    public addToOrderedQueue = (frag: Frag): Frag[] => {
        const fragsToSend = []
        this.unprocessedFrags.push(frag)
        this.unprocessedFrags.sort((a, b) => a.idx - b.idx)

        while (this.unprocessedFrags.length &&
                this.unprocessedFrags[0].idx === FragQueue.peekNextFrag()?.idx) {
            const newFrag = this.unprocessedFrags.shift() as Frag
            if (newFrag.downloaded) {
                if (newFrag.idx !== this.lastProcessedIdx + 1 && this.lastProcessedIdx !== 0) {
                    // break in sequence of frags
                    console.log('!! Encountered gap in frags, adding discontinuity tag')
                    newFrag.tagLines.unshift('#EXT-X-DISCONTINUITY')
                    newFrag.tagLines = newFrag.tagLines.filter((tag: string) => {
                            return !(tag.indexOf('#EXTM3U') > -1 ||
                                    tag.indexOf('#EXT-X-VERSION') > -1 ||
                                    tag.indexOf('#EXT-X-MEDIA-SEQUENCE') > -1 ||
                                    tag.indexOf('#EXT-X-TARGETDURATION') > -1 ||
                                    tag.indexOf('#EXT-X-DISCONTINUITY-SEQUENCE') > -1)
                        })
                }
                fragsToSend.push(newFrag)
                this.errorCount = 0
            } else {
                this.errorCount++
                if (this.errorCount > maxNetworkError) {
                    console.log(`Max frags not downloaded, cancelling ticker`)
                    Messages.cancelTicker()
                }
            }
            this.lastProcessedIdx = newFrag.idx
            FragQueue.shift()
        }
        return fragsToSend
    }
}

export default new OrganizeFrags