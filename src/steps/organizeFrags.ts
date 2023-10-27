import { Frag } from "../types/frag";
import { maxNetworkError } from "../utils/config";
import FragQueue from "../utils/fragQueue";
import Messages from "../utils/messages";

class OrganizeFrags {
  private unprocessedFragsMap: {
    [levelUrl: string]: {
      frags: Frag[];
      lastProcessedIdx: number;
    };
  } = {};
  private errorCount = 0;

  public addToOrderedQueue = (frag: Frag): Frag[] => {
    const levelUrl = frag.level.remoteUrl;
    if (!this.unprocessedFragsMap[levelUrl]) {
      this.unprocessedFragsMap[levelUrl] = {
        frags: [],
        lastProcessedIdx: 0,
      };
    }

    const fragsToSend = [];
    this.unprocessedFragsMap[levelUrl].frags.push(frag);
    this.unprocessedFragsMap[levelUrl].frags.sort((a, b) => a.idx - b.idx);

    while (
      this.unprocessedFragsMap[levelUrl].frags.length &&
      this.unprocessedFragsMap[levelUrl].frags[0].idx ===
        FragQueue.peekNextFrag(frag.level.remoteUrl)?.idx
    ) {
      const newFrag = this.unprocessedFragsMap[levelUrl].frags.shift() as Frag;
      if (newFrag.downloaded) {
        if (
          newFrag.idx !==
            this.unprocessedFragsMap[levelUrl].lastProcessedIdx + 1 &&
          this.unprocessedFragsMap[levelUrl].lastProcessedIdx !== 0
        ) {
          // break in sequence of frags
          console.log("!! Encountered gap in frags, adding discontinuity tag");
          newFrag.tagLines.unshift("#EXT-X-DISCONTINUITY");
          newFrag.tagLines = newFrag.tagLines.filter((tag: string) => {
            return !(
              tag.indexOf("#EXTM3U") > -1 ||
              tag.indexOf("#EXT-X-VERSION") > -1 ||
              tag.indexOf("#EXT-X-MEDIA-SEQUENCE") > -1 ||
              tag.indexOf("#EXT-X-TARGETDURATION") > -1 ||
              tag.indexOf("#EXT-X-DISCONTINUITY-SEQUENCE") > -1
            );
          });
        }
        fragsToSend.push(newFrag);
        this.errorCount = 0;
      } else {
        this.errorCount++;
        if (this.errorCount > maxNetworkError) {
          console.log(`Max frags not downloaded, cancelling ticker`);
          Messages.cancelTicker();
        }
      }
      this.unprocessedFragsMap[levelUrl].lastProcessedIdx = newFrag.idx;
      FragQueue.shift(newFrag.level.remoteUrl);
    }
    return fragsToSend;
  };
}

export default new OrganizeFrags();
