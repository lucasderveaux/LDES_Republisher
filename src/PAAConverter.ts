import { ObservationKeeper } from "./Objects/ObservationKeeper";
import { SortedMap } from "collections/sorted-map";
import { resolve } from "path";

export class PAAConverter {
    constructor() {

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


                //in milliseconds
                // 24 hours in a day, 60 minutes in an hour, 60 seconds in a minute, 100 miliseconds in a second
                let divider = (24 * 60 * 60 * 100) / sortedMap.length;

                let beginInterval = 0;
                let endInterval = divider;

                let map = new Map<number, Array<number>>();

                for (let key of sortedMap.keys()) {
                    
                    let toTest = key - min;
                    //kijken of het überhaupt kan
                    //eigenlijk moet ik overal evenveel observaties hebben.
                    //nee nee losse punten
                    while (toTest > endInterval) {
                        //dit kan eigenlijk niet meer dan 1 keer voorkomen
                        //maar in voorzorg wordt dit er wel ingestoken
                        //you never know
                        //maar ja dan moet ik wel hier iets insteken
                        //0 kan niet... misschien dan de waarde van de vorige?
                        //nee eigenlijk is het beter niets
                        beginInterval = endInterval;
                        endInterval += divider;
                    }

                    if (!map.has(beginInterval)) {
                        map.set(beginInterval, new Array<number>());
                        
                    }
                    

                    //op dit punt zijn de arrays gemaakt en zitten we in de juiste interval
                    //er zijn twee opties ofwle zitten we in het juiste interval 
                    //ofwel op de grens en zitten we in beide

                    //zit in beide
                    if (toTest == endInterval) {
                        map.get(beginInterval).push(sortedMap.get(key));
                        if(!map.has(endInterval)){
                            map.set(endInterval, new Array<number>());
                        }
                        map.get(endInterval).push(sortedMap.get(key));
                    }

                    if (toTest > beginInterval && toTest < endInterval) {
                        map.get(beginInterval).push(sortedMap.get(key));
                    } else {
                        //dit kan eigenlijk niet
                        //er is iets mis gegaan met de volgorde van de iterator van de sortedMap
                        while (toTest < beginInterval) {
                            endInterval = beginInterval;
                            beginInterval = endInterval - divider;
                        }
                        map.get(beginInterval).push(sortedMap.get(key))
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

                resolve(endMap);
            } catch (e) {
                console.error(e);
                reject(e);
            }
        });
    }
}