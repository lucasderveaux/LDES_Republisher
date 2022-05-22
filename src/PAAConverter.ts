import { ObservationKeeper } from "./Objects/ObservationKeeper";
import { SortedMap } from "collections/sorted-map";
import { IConfig } from "./config";

export class PAAConverter {
    private readonly config: IConfig;
    constructor(config: IConfig) {
        this.config = config;
    }

    /*
    Hier moet er opnieuw een mapping gebeuren die de array overloopt in twee stukken
    */

    public async ConvertAll(keeperOfTheObservations: ObservationKeeper) {
        for (let w of keeperOfTheObservations.simpleValues.keys()) {
            // dit zijn de types
            for (let x of keeperOfTheObservations.simpleValues.get(w).keys()) {
                //dit zijn de dagen
                for (let y of keeperOfTheObservations.simpleValues.get(w).get(x).keys()) {
                    //dit zijn de stations
                    try {
                        let endMap: SortedMap;
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
                //amound of milliseconds since January 1, 1970, 00:00:00
                let min: number = sortedMap.keys().next().value;

                let number_of_observations = sortedMap.length;

                // console.log("number_of_observations is "+this.config.number_of_observations);

                if (this.config.number_of_observations != 0) {
                    if (this.config.number_of_observations < number_of_observations) {
                        number_of_observations = this.config.number_of_observations;
                        console.log("divider is veranderd")
                    } else {
                        console.log("requested number of observations cannot be provided")
                    }
                }
              

                //in milliseconds
                // 24 hours in a day, 60 minutes in an hour, 60 seconds in a minute, 1000 miliseconds in a second
                let divider = Math.round((24*60*60 * 1000) / number_of_observations);
                console.log("divider is:" + divider);

                let beginInterval = min;
                let endInterval = beginInterval + divider;

                let map = new Map<number, Array<number>>();

                for (let key of sortedMap.keys()) {

                    //kijken of het überhaupt kan
                    //eigenlijk moet ik overal evenveel observaties hebben.
                    //nee nee losse punten
                    while (key > endInterval) {
                        //dit kan eigenlijk niet meer dan 1 keer voorkomen
                        //maar in voorzorg wordt dit er wel ingestoken
                        //you never know
                        //maar ja dan moet ik wel hier iets insteken
                        //0 kan niet... misschien dan de waarde van de vorige?
                        //nee eigenlijk is het beter niets
                        beginInterval = endInterval;
                        endInterval += divider;
                    }

                    if (!map.has(beginInterval+divider/2)) {
                        map.set(beginInterval+(divider/2), new Array<number>());

                    }


                    //op dit punt zijn de arrays gemaakt en zitten we in de juiste interval
                    //er zijn twee opties ofwel zitten we in het juiste interval 
                    //ofwel op de grens en zitten we in beide

                    //zit in beide
                    if (key == endInterval) {
                        map.get((beginInterval+divider/2)).push(sortedMap.get(key));
                        if (!map.has((endInterval+divider/2))) {
                            map.set((endInterval+divider/2), new Array<number>());
                        }
                        map.get((endInterval+divider/2)).push(sortedMap.get(key));
                    }

                    if (key > beginInterval && key < endInterval) {
                        map.get((beginInterval+divider/2)).push(sortedMap.get(key));
                    } else {
                        //dit kan eigenlijk niet
                        //er is iets mis gegaan met de volgorde van de iterator van de sortedMap
                        while (key < beginInterval) {
                            endInterval = beginInterval;
                            beginInterval = endInterval - divider;
                        }
                        map.get((beginInterval+divider/2)).push(sortedMap.get(key))
                    }
                }

                //hier hebben we dus de map<number,Array<number>>
                //en map met als key het begin van de interval en als value een array waar we het gemiddelde van moeten nemen
                //dus wat ik nu moet doen is de juiste sortedMap aanmaken met het gemiddelde van elke Array<number>

                let endMap = new SortedMap();
                for (let key of map.keys()) {

                    let avg: number = 0;
                    let div: number = map.get(key).length;
                    if (map.get(key).length != 0) {
                        for (let n of map.get(key)) {

                            avg += n;

                        }
                    }
                    avg = avg / div;

                    endMap.set(key, avg);

                }
                console.log("endmap heeft " + endMap.length);

                resolve(endMap);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
}