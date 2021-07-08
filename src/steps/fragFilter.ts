import { Frag } from "../types/frag";
import Messages from "../utils/messages";

import { maxStallCount } from "../utils/config" 


class FragFilter {
    private isFirstParse = true
    private mostRecentIdx = -1
    private stallCount = 0

    public extractNewFrags = (parsedData: [Frag[], boolean]): Frag[] => {
        const allFrags = parsedData[0]
        const hasEndlist = parsedData[1]
        let newFrags: Frag[] = []
        if (allFrags.length) {
            if (hasEndlist && this.isFirstParse) {
                // vod
                newFrags = allFrags
                console.log('Vod manifest detected, cancelling ticker')
                Messages.cancelTicker()
            } else {
                // live
                if (this.isFirstParse) {
                    this.isFirstParse = false
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
        if (this.isFirstParse && newFrags.length) {

        }
        return newFrags
    }
}

export default new FragFilter