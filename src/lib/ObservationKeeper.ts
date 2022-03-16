import { FeatureOfInterest } from "./FeatureOfInterest";
import { Observation } from "./Observation";

export class ObservationKeeper {
    simpleValues: Map<string, Map<string, Array<Observation>>>;
    featureOfInterests: Map<string, FeatureOfInterest>;
    constructor() {
        this.simpleValues = new Map<string, Map<string, Array<Observation>>>();
        this.featureOfInterests = new Map<string, FeatureOfInterest>();
    }

    private createNewSimpleValue(idSimpleValue: string): void {
        this.simpleValues.set(idSimpleValue, new Map<string, Array<Observation>>());
    }

    private createNewLocationId(idSimpleValue: string, idLocation: string): void {
        this.simpleValues.get(idSimpleValue).set(idLocation, new Array<Observation>());
    }

    public addSimpleValue(idSimpleValue: string, idLocation: string, simpleValue: Observation) {
        if (!this.simpleValues.has(idSimpleValue)) {
            //console.log(idSimpleValue + " besta niet");
            this.createNewSimpleValue(idSimpleValue);
        }

        if (!this.simpleValues.get(idSimpleValue).has(idLocation)) {
            //console.log(idLocation + "besta niet");
            this.createNewLocationId(idSimpleValue, idLocation);
        }
        this.simpleValues.get(idSimpleValue).get(idLocation).push(simpleValue);
        //console.log("simple value toegevoegd");
    }

    public addFeatureOfInterest(feature: FeatureOfInterest) {
        this.featureOfInterests.set(feature.getId(), feature);
    }

}