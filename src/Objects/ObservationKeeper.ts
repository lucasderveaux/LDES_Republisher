import { SortedMap } from "collections/sorted-map";

export class ObservationKeeper {
    simpleValues: Map<string, Map<string, Map<string, SortedMap>>>;
    //simplevalues
    // - key is the string of the predicate of the type of the observation
    // -   - key is the string of the day of the observations
    // -   -   - key is the location of the observation
    // -   -   -   - contains sortedMap with the milliseconds since January 1, 1970, 00:00:00 as priority key
    featureOfInterests: Map<string, string>;
    constructor() {
        this.simpleValues = new Map<string, Map<string, Map<string, SortedMap>>>();
        this.featureOfInterests = new Map<string, string>();
    }

    private createNewSimpleValue(typeOfSimpleValue: string): void {
        this.simpleValues.set(typeOfSimpleValue, new Map<string, Map<string, SortedMap>>());
    }

    private createNewLocationId(typeOfSimpleValue: string, day: string, idLocation: string): void {
        this.simpleValues.get(typeOfSimpleValue).get(day).set(idLocation, new SortedMap());
    }

    private createNewDay(typeOfSimpleValue: string, day: string) {
        this.simpleValues.get(typeOfSimpleValue).set(day, new Map<string, SortedMap>());
    }

    public addSimpleValue(typeOfSimpleValue: string, idLocation: string, timestamp: string, simpleValue: number) {
        let priority = Date.parse(timestamp);
        let day = new Date(timestamp).toDateString();
        if (!this.simpleValues.has(typeOfSimpleValue)) {
            this.createNewSimpleValue(typeOfSimpleValue);
        }

        if (!this.simpleValues.get(typeOfSimpleValue).has(day)) {
            this.createNewDay(typeOfSimpleValue, day);
        }

        if (!this.simpleValues.get(typeOfSimpleValue).get(day).has(idLocation)) {
            this.createNewLocationId(typeOfSimpleValue, day, idLocation);
        }
        this.simpleValues.get(typeOfSimpleValue).get(day).get(idLocation).set(priority, simpleValue);
    }

    public addFeatureOfInterest(idLocation: string, versionOf: string) {
        if (!this.featureOfInterests.has(idLocation)) {
            this.featureOfInterests.set(idLocation, versionOf);
        }
    }

}