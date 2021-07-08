import { concatMap, map, mergeAll, mergeMap, interval, startWith, takeUntil, timer, race } from 'rxjs'

import Events from './utils/events'
import LevelRequest from './steps/levelRequest'
import LevelParse from './steps/levelParse'
import NewFrags from './steps/newFrags'
import DownloadFrag from './steps/downloadFrag'
import OrderFrags from './steps/orderFrags'
import WriteToManifest from './steps/writeToManifest'

import { tickSeconds, stopAfter, maxConcurrentDownloads } from "./utils/config"
import Finished from './steps/onFinish'

console.log('program start')

interval(tickSeconds * 1000)
    .pipe(
        startWith(0),
        takeUntil(race(timer(stopAfter * 1000), Events.tickerCanceled)),
        mergeMap(LevelRequest.requestLevel),
        map(LevelParse.parseLevel),
        map(NewFrags.getNewFrags),
        mergeAll(),
        mergeMap(DownloadFrag.download, maxConcurrentDownloads),
        map(OrderFrags.onDownload),
        mergeAll(),
        concatMap(WriteToManifest.write)
    )
    .subscribe({complete: Finished.onFinish})