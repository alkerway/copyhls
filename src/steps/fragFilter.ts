import { Frag } from "../types/frag";
import Messages from "../utils/messages";

import { maxStallCount } from "../utils/config" 
import FragQueue from "../utils/fragQueue";


class FragFilter {
    private skipFirstBunch = false // true
    private mostRecentIdx = -1
    private stallCount = 0

    public findNewFrags = (parsedData: [Frag[], boolean]): Frag[] => {
        const [allFrags, hasEndlist] = parsedData
        let newFrags: Frag[] = []
        if (allFrags.length) {
            if (hasEndlist && this.mostRecentIdx === -1) {
                // vod
                newFrags = allFrags
                console.log('Vod manifest detected, cancelling ticker')
                Messages.cancelTicker()
            } else {
                // live
                if (this.skipFirstBunch) {
                    this.skipFirstBunch = false
                    const headerTags = allFrags[0].tagLines
                    const lastFrag = allFrags[allFrags.length - 1]
                    const uniqueTags = headerTags.map((tag) => {
                        if (lastFrag.tagLines.find(lastTag => lastTag.indexOf(tag.split(':')[0]) > -1)) {
                            return ''
                        }
                        if (tag.indexOf('#EXT-X-MEDIA-SEQUENCE:') > -1) {
                            return `#EXT-X-MEDIA-SEQUENCE:${lastFrag.idx}`
                        }
                        return tag
                    })
                    .filter(tag => tag)
                    lastFrag.tagLines = uniqueTags.concat(lastFrag.tagLines)
                    this.mostRecentIdx = lastFrag.idx
                    Messages.setFirstFragIdx(this.mostRecentIdx)
                    newFrags = [lastFrag]
                } else if (hasEndlist) {
                    console.log('Live manifest end encountered, cancelling ticker')
                    Messages.cancelTicker()
                } else {
                    const incomingFrags = allFrags.filter(f => this.mostRecentIdx < f.idx)
                    if (incomingFrags.length) {
                        this.mostRecentIdx = incomingFrags[incomingFrags.length - 1].idx
                        newFrags = incomingFrags
                        this.stallCount = 0
                    } else {
                        this.stallCount++
                        console.log(`level stall count ${this.stallCount}`)
                        if (this.stallCount > maxStallCount) {
                            console.log(`Stall count exceeded max, cancelling ticker`)
                            Messages.cancelTicker()
                        }
                    }
                }
            }
        }
        FragQueue.addFragsFromManifest(newFrags)
        return newFrags
    }
}

export default new FragFilter