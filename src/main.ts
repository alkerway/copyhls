import { concatMap, map, mergeAll, mergeMap, interval, startWith, takeUntil, timer } from 'rxjs'

import Events from './utils/events'
import LevelRequest from './steps/levelRequest'
import LevelParse from './steps/levelParse'
import NewFrags from './steps/newFrags'
import DownloadFrag from './steps/downloadFrag'


import WriteToManifest from './steps/writeToManifest'
import { tickSeconds, stopAfter, maxConcurrentDownloads } from "./utils/config"
import OrderFrags from './steps/orderFrags'


console.log('program start')

// main flow
interval(tickSeconds * 1000)
        .pipe(
            takeUntil(Events.tickerCanceled),
            startWith(0),
            mergeMap(LevelRequest.requestLevel),
            map(LevelParse.parseLevel),
            map(NewFrags.getNewFrags),
            mergeAll(),
            mergeMap(DownloadFrag.download, maxConcurrentDownloads),
            map(OrderFrags.onDownload),
            mergeAll(),
            concatMap(WriteToManifest.write),
            map((frag) => `Frag ${frag.idx} written to ${frag.storagePath}`)
        )
    .subscribe(console.log)

// other events
timer(stopAfter * 1000)
    .subscribe(Events.cancelTicker)