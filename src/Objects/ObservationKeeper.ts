import { FeatureOfInterest } from "./FeatureOfInterest";
import { Observation } from "./Observation";

export class ObservationKeeper {
    simpleValues: Map<string, Map<string,Map<string, Array<Observation>>>>;
    simplevalues
    // - type
    // -   - dag
    // -   -   -observation
    featureOfInterests: Map<string, FeatureOfInterest>;
    constructor() {
        this.simpleValues = new Map<string, Map<string,Map<string, Array<Observation>>>>();
        this.featureOfInterests = new Map<string, FeatureOfInterest>();
    }

    private createNewSimpleValue(idSimpleValue: string): void {
        this.simpleValues.set(idSimpleValue, new Map<string, Map<string,Array<Observation>>>());
    }

    private createNewLocationId(idSimpleValue: string, day:string,idLocation: string): void {
        this.simpleValues.get(idSimpleValue).get(day).set(idLocation, new Array<Observation>());
    }

    private createNewDay(idSimpleValue:string,day:string){
        this.simpleValues.get(idSimpleValue).set(day,new Map<string,Array<Observation>>());
    }

    public addSimpleValue(idSimpleValue: string, idLocation: string, simpleValue: Observation) {
        let day = new Date(simpleValue.getTimestamp()).toDateString();
        //console.log(day);
        if (!this.simpleValues.has(idSimpleValue)) {
            //console.log(idSimpleValue + " besta niet");
            this.createNewSimpleValue(idSimpleValue);
        }

        if(!this.simpleValues.get(idSimpleValue).has(day)){
            this.createNewDay(idSimpleValue,day);
        }

        if (!this.simpleValues.get(idSimpleValue).get(day).has(idLocation)) {
            //console.log(idLocation + "besta niet");
            this.createNewLocationId(idSimpleValue,day, idLocation);
        }
        this.simpleValues.get(idSimpleValue).get(day).get(idLocation).push(simpleValue);
        //console.log("simple value toegevoegd");
    }

    public addFeatureOfInterest(feature: FeatureOfInterest) {
        this.featureOfInterests.set(feature.getId(), feature);
    }

}