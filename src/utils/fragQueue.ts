import { Frag } from "../types";

class FragQueue {
  private fragQueueMap: {
    [levelUrl: string]: Frag[];
  } = {};

  public addFragsFromManifest = (levelUrl: string, manifestFrags: Frag[]) => {
    if (!this.fragQueueMap[levelUrl]) {
      this.fragQueueMap[levelUrl] = [];
    }
    this.fragQueueMap[levelUrl] =
      this.fragQueueMap[levelUrl].concat(manifestFrags);
  };

  public peekNextFrag = (levelUrl: string): Frag | null => {
    if (!this.fragQueueMap[levelUrl]?.length) {
      return null;
    }
    return this.fragQueueMap[levelUrl][0];
  };

  public shift = (levelUrl: string): Frag | null => {
    if (!this.fragQueueMap[levelUrl]?.length) {
      return null;
    }
    return this.fragQueueMap[levelUrl].shift() || null;
  };
}

export default new FragQueue();
