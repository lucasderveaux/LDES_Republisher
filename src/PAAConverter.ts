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
                        endMap = await this.convertTwo(keeperOfTheObservations.simpleValues.get(w).get(x).get(y));
                        //overwrite SortedMap
                        keeperOfTheObservations.simpleValues.get(w).get(x).set(y, endMap);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }
    }


    //This functions finds the largest amount of time in between two observations
    // This will be the timestep of the entire regular time series
    private findTimeStep(sortedMap: SortedMap): number {

        let previousDate: number = sortedMap.keys().next().value;
        let max: number = 0;
        for (let x of sortedMap.keys()) {
            if ((x - previousDate) > max) {
                max = x - previousDate;
            }
            previousDate = x;
        }

        return max;
    }



    public convertOne(sortedMap: SortedMap): Promise<SortedMap> {
        return new Promise<SortedMap>(async (resolve, reject) => {
            try {
                //amount of milliseconds since January 1, 1970, 00:00:00
                let date = new Date(sortedMap.keys().next().value);
                let betweenDate = date.toDateString() + " 00:00:00";
                let min: number = Date.parse(betweenDate);

                let divider: number = await this.findTimeStep(sortedMap);
                //in milliseconds
                // 24 hours in a day, 60 minutes in an hour, 60 seconds in a minute, 1000 miliseconds in a second
                let number_of_observations = Math.floor((24 * 60 * 60 * 1000) / divider);
                if (this.config.number_of_observations != 0) {
                    if (this.config.number_of_observations < number_of_observations) {
                        divider = Math.round((24 * 60 * 60 * 1000) / this.config.number_of_observations);
                    } else {
                        // In this case dimensionality reduction cannot be provided
                        console.log("requested number of observations cannot be provided")
                    }
                }

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

    public convertTwo(sortedMap: SortedMap): Promise<SortedMap> {
        return new Promise<SortedMap>(async (resolve, reject) => {
            try {
                //creation of the returned SortedMap
                let endMap = new SortedMap<number, number>();
                
                //creation of the divider
                let divider:number;

                //The divider is the timestep in the regular time-series between two following observations
                //the goal is a timestep with the least amount of NaN values but not to reduce the dimensionality of the given time series too much
                //Ideally the maximum timestep between two following observations would be used. But this would mean that every given time series needs to be
                //run through twice and the maximum value needs to be calculated.
                //which took over 8 hours

                //A different approach was used for deciding on the right divider.
                //the time between the two first observations is used, in the hope that this is representative for the time the following observations of the entire time series
                //afterwards 24h is divided by the amount of the values in the sortedMap
                //the largest value of the two is used

                let iterator = sortedMap.keys();
                let first = iterator.next().value;
                let next = iterator.next().value;

                divider = next - first;
                //amount of milliseconds since January 1, 1970, 00:00:00

                let date = new Date(first);
                let betweenDate = date.toDateString() + " 00:00:00";
                let min: number = Date.parse(betweenDate);

            

                if ((first - min) > divider) {
                    divider = first - min;
                }



                if (Math.ceil((24 * 60 * 60 * 1000) / sortedMap.length) > divider) {
                    divider = Math.ceil((24 * 60 * 60 * 1000) / sortedMap.length);
                }



                let number_of_observations = Math.floor((24 * 60 * 60 * 1000) / divider);

                if (this.config.number_of_observations!=0) {
                    if (this.config.number_of_observations < number_of_observations) {
                        divider = Math.round((24 * 60 * 60 * 1000) / this.config.number_of_observations);
                    } else {
                        // In this case dimensionality reduction cannot be provided
                        console.log("requested number of observations cannot be provided")
                    }
                }



                let beginInterval = min;
                let endInterval = beginInterval + divider;

                let i = 0;
                let num = 0;

                for (let key of sortedMap.keys()) {
                    //value of the key is before the window
                    //this shouldn't be possible, just in case this possibility is taken into account
                    while (key < beginInterval) {
                        endMap.set((beginInterval + divider / 2), NaN);
                    }

                    //key in the window
                    if (key >= beginInterval && key < endInterval) {
                        i++;
                        if (sortedMap.get(key) == NaN) {
                            num += 0;
                        } else {
                            num += sortedMap.get(key);
                        }

                    }

                    // window changes
                    if (key > endInterval) {
                        if (i != 0) {
                            endMap.set((beginInterval + divider / 2), num / i);
                            num = 0;
                            i = 0;
                            beginInterval = endInterval;
                            endInterval = endInterval + divider;
                        } // key is the first value
                        while (key > endInterval) {
                            endMap.set((beginInterval + divider / 2), NaN);
                            beginInterval = endInterval;
                            endInterval = endInterval + divider;
                        }
                        if (sortedMap.get(key) == NaN) {
                            num += 0;
                        } else {
                            num += sortedMap.get(key);
                        }
                        i = 1;

                    }



                }
                //last key
                if (i != 0) {
                    endMap.set(beginInterval + divider / 2, num / i);
                }

                
                    resolve(endMap);
                
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });

    }
}