import { concatMap, map, mergeAll, mergeMap, interval, startWith, takeUntil, timer, race } from 'rxjs'

import LevelRequest from './steps/levelRequest'
import LevelParse from './steps/levelParse'
import FragFilter from './steps/fragFilter'
import DownloadFrag from './steps/downloadFrag'
import OrganizeFrags from './steps/organizeFrags'
import WriteToManifest from './steps/writeToManifest'
import Decrypter from './steps/decryptFrag'
import Finished from './steps/onFinish'

import { levelPollInterval, stopAfter, maxConcurrentDownloads } from "./utils/config"
import Messages from './utils/messages'
import DownloadKey from './steps/downloadKey'

console.log('program start')

interval(levelPollInterval * 1000)
    .pipe(
        startWith(0),
        takeUntil(race(timer(stopAfter * 1000), Messages.tickerCanceled)),
        mergeMap(LevelRequest.requestLevel),
        map(LevelParse.getFragsFromManifest),
        map(FragFilter.findNewFrags),
        mergeAll(),
        mergeMap(DownloadKey.download, maxConcurrentDownloads),
        mergeMap(DownloadFrag.download, maxConcurrentDownloads),
        map(OrganizeFrags.addToOrderedQueue),
        mergeAll(),
        mergeMap(Decrypter.decryptIfConfigSaysSo),
        concatMap(WriteToManifest.write)
    )
    .subscribe({complete: Finished.assembleVideo})