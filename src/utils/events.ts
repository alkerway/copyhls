import { Subject } from "rxjs";

import { Frag } from '../types/frag'

class Events {
    // main flow
    public tick = new Subject<void>()
    public levelResponse = new Subject<string>()
    public levelParsed = new Subject<Frag[]>()
    public newFrags = new Subject<Frag[]>()
    public fragDownloaded = new Subject<Frag>()
    public fragWritten = new Subject<Frag>()
    
    // other 
    public tickerCanceled = new Subject<void>()

    // main flow
    public doTick = () => {
        this.tick.next()
    }

    public onLevelResponse = (manifest: string) => {
        this.levelResponse.next(manifest)
    }

    public onLevelParsed = (frags: Frag[]) => {
        this.levelParsed.next(frags)
    }

    public onNewFrags = (frags: Frag[]) => {
        this.newFrags.next(frags)
    }

    public onFragDownloaded = (frag: Frag) => {
        this.fragDownloaded.next(frag)
    }

    public onFragWritten = (frag: Frag) => {
        this.fragWritten.next(frag)
    }

    // other
    public cancelTicker = () => {
        this.tickerCanceled.next()
    }
}

export default new Events()