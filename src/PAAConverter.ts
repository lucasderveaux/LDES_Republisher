import { ObservationKeeper } from "./Objects/ObservationKeeper";
import { IConfig } from "./config";
import { SortedMap } from "collections/sorted-map";

export class PAAConverter {
    private readonly config: IConfig;
    constructor(config: IConfig) {
        this.config = config;
    }

    public async ConvertAll(keeperOfTheObservations: ObservationKeeper) {
        for (let w of keeperOfTheObservations.simpleValues.keys()) {
            // the type of the observation
            for (let x of keeperOfTheObservations.simpleValues.get(w).keys()) {
                // the string of the day
                for (let y of keeperOfTheObservations.simpleValues.get(w).get(x).keys()) {
                    // the feature of intrest
                    try {
                        let endMap: SortedMap;
                        // endMap  is the regular time series map
                        endMap = await this.convertOne(keeperOfTheObservations.simpleValues.get(w).get(x).get(y));
                        //overwrite SortedMap
                        keeperOfTheObservations.simpleValues.get(w).get(x).set(y, endMap);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    }



    public convertOne(sortedMap: SortedMap): Promise<SortedMap> {
        return new Promise<SortedMap>(async (resolve, reject) => {
            try {
                //amount of milliseconds since January 1, 1970, 00:00:00

                let date = new Date(sortedMap.keys().next().value);
                let betweenDate = date.toDateString() + " 00:00:00";
                let min: number = Date.parse(betweenDate);


                let number_of_observations = sortedMap.length;

                if (this.config.number_of_observations != 0) {
                    if (this.config.number_of_observations < number_of_observations) {
                        number_of_observations = this.config.number_of_observations;
                    } else {
                        // In this case dimensionality reduction cannot be provided
                        console.log("requested number of observations cannot be provided")
                    }
                }



                //in milliseconds
                // 24 hours in a day, 60 minutes in an hour, 60 seconds in a minute, 1000 miliseconds in a second
                let divider = Math.round((24 * 60 * 60 * 1000) / number_of_observations);

                let beginInterval = min;
                let endInterval = beginInterval + divider;

                let map = new Map<number, Array<number>>();

                for (let key of sortedMap.keys()) {
                    while (key > endInterval) {
                        // It shouldn't be possible that the interval changes more than once
                        // but out of precaution the interval is moved.
                        if (!map.has((beginInterval + divider / 2))) {
                            map.set((beginInterval + divider / 2), new Array<number>());
                            //a NaN is added because otherwise the RegularTimeSeries wouldn't be correct
                            map.get((beginInterval + divider / 2)).push(sortedMap.get(NaN));
                        }

                        beginInterval = endInterval;
                        endInterval += divider;
                    }

                    if (!map.has((beginInterval + divider / 2))) {
                        map.set((beginInterval + divider / 2), new Array<number>());

                    }

                    // The key is in both intervals
                    if (key == endInterval) {
                        map.get((beginInterval + divider / 2)).push(sortedMap.get(key));
                        if (!map.has((endInterval + divider / 2))) {
                            map.set((endInterval + divider / 2), new Array<number>());
                        }
                        map.get(((endInterval + divider / 2))).push(sortedMap.get(key));
                    }

                    if (key > beginInterval && key < endInterval) {
                        map.get((beginInterval + divider / 2)).push(sortedMap.get(key));
                    } else {
                        //this shouldn't be possible
                        // but it is added becuase something went wrong with the used sorted-Map
                        while (key < beginInterval) {
                            endInterval = beginInterval;
                            beginInterval = endInterval - divider;
                        }
                        map.get((beginInterval + divider / 2)).push(sortedMap.get(key))
                    }
                }

                //At this point every interval has a map<number,Array<number>>
                //the average of each array is calculated per interval

                let endMap = new SortedMap();
                for (let key of map.keys()) {
                    let avg: number = 0;
                    let div: number = map.get(key).length;
                    if (div == 1 && map.get(key)[0] == NaN) {
                        endMap.set(key, NaN);
                    } else {
                        if (div != 0) {
                            for (let n of map.get(key)) {
                                avg += n;
                            }
                        }
                        avg = avg / div;
                        endMap.set(key, avg);
                    }
                }
                resolve(endMap);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
}