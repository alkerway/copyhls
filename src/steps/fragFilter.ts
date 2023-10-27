import { Frag } from "../types/frag";
import Messages from "../utils/messages";

import { maxStallCount } from "../utils/config";
import FragQueue from "../utils/fragQueue";

class FragFilter {
  private skipFirstBunch = false; // true
  private levelTrackerCache: {
    [levelRemoteUrl: string]: { mostRecentIdx: number; stallCount: number };
  } = {};
  private loggedEndlist = false

  public findNewFrags = ({
    frags: allFrags,
    hasEndlist,
  }: {
    frags: Frag[];
    hasEndlist: boolean;
  }): Frag[] => {
    let newFrags: Frag[] = [];
    let levelUrl = allFrags[0].level.remoteUrl;
    
    if (!this.levelTrackerCache[levelUrl]) {
      this.levelTrackerCache[levelUrl] = {
        mostRecentIdx: -1,
        stallCount: 0,
      };
    }
    
    if (allFrags.length) {
      if (hasEndlist && this.levelTrackerCache[levelUrl].mostRecentIdx < 0) {
        // vod
        newFrags = allFrags;
        if (!this.loggedEndlist) {
          console.log("Vod manifest detected, cancelling ticker");
          this.loggedEndlist = true
          Messages.cancelTicker();
        }
      } else {
        // live
        if (this.skipFirstBunch && this.levelTrackerCache[levelUrl].mostRecentIdx < 0) {
          const headerTags = allFrags[0].tagLines;
          const lastFrag = allFrags[allFrags.length - 1];
          const uniqueTags = headerTags
            .map((tag) => {
              if (
                lastFrag.tagLines.find(
                  (lastTag) => lastTag.indexOf(tag.split(":")[0]) > -1
                )
              ) {
                return "";
              }
              if (tag.indexOf("#EXT-X-MEDIA-SEQUENCE:") > -1) {
                return `#EXT-X-MEDIA-SEQUENCE:${lastFrag.idx}`;
              }
              return tag;
            })
            .filter((tag) => tag);
          lastFrag.tagLines = uniqueTags.concat(lastFrag.tagLines);
          this.levelTrackerCache[levelUrl].mostRecentIdx = lastFrag.idx;
          newFrags = [lastFrag];
        } else if (hasEndlist) {
          console.log("Live manifest end encountered, cancelling ticker");
          Messages.cancelTicker();
        } else {
          const incomingFrags = allFrags.filter(
            (f) =>
              !this.levelTrackerCache[levelUrl] ||
              this.levelTrackerCache[levelUrl].mostRecentIdx < f.idx
          );
          if (incomingFrags.length) {
            this.levelTrackerCache[levelUrl].mostRecentIdx =
              incomingFrags[incomingFrags.length - 1].idx;
            newFrags = incomingFrags;
            this.levelTrackerCache[levelUrl].stallCount = 0;
          } else {
            this.levelTrackerCache[levelUrl].stallCount++;
            if (this.levelTrackerCache[levelUrl].stallCount > maxStallCount) {
              console.log(`Stall count exceeded max, cancelling ticker`);
              Messages.cancelTicker();
            }
          }
        }
      }
    }
    FragQueue.addFragsFromManifest(levelUrl, newFrags);
    return newFrags;
  };
}

export default new FragFilter();
