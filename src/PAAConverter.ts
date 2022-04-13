import { ObservationKeeper } from "./Objects/ObservationKeeper";
import {SortedMap} from "collections/sorted-map";

export class PAAConverter{
    constructor(){

    }

    /*
    Hier moet er opnieuw een mapping gebeuren die de array overloopt in twee stukken
    */

    public ConvertAll(keeperOfTheObservations:ObservationKeeper){
        for (let w of keeperOfTheObservations.simpleValues.keys()) {
            // dit zijn de types
            console.log(w);
            for (let x of keeperOfTheObservations.simpleValues.get(w).keys()) {
                //dit zijn de stations
                console.log("\t-\t" + x);
                for (let y of keeperOfTheObservations.simpleValues.get(w).get(x).keys()) {
                    //dit zijn de dagen
                    console.log("\t\t\t" + y);
                    //console.log(this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y));
                    // for (let z of this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y).keys()) {
                    //     //dit is de sortedMap
                    //     console.log("\t\t\t\t" + this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y).get(z));
                    // }
                    this.convertOne(y,keeperOfTheObservations.simpleValues.get(w).get(x).get(y));
                }
            }
        }
    }

    public convertOne(key:string,sortedMap:SortedMap){
        //amound of milliseconds since January 1, 1970, 00:00:00
        let min:number = sortedMap.keys().next().value;
        
        
        //in milliseconds
        // 24 hours in a day, 60 minutes in an hour, 60 seconds in a minute, 100 miliseconds in a second
        let divider = (24*60*60*100)/sortedMap.length;

        let begin = 0;
        let end = divider;

        let map=new Map<number,Array<number>>();

        for(let key of sortedMap.keys()){
            if(!map.has(begin)){
                map.set(begin,new Array<number>());
            }

            let time = key-min;
            //dit is nog niet af!!!!
            
            if(time>=begin || time<=end){
                map.get(begin).push(sortedMap.get(key));
            }
        }
    }
}