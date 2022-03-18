import { ObservationKeeper } from "./lib/ObservationKeeper";
import type * as RDF from 'rdf-js';
import { FeatureOfInterest } from "./lib/FeatureOfInterest";
import { Observation } from "./lib/Observation";
import { literal, namedNode, blankNode, quad} from '@rdfjs/data-model';

export class QuadTheCreator {
    constructor() {
        console.log("Quad the creator has started");
    }

    public writeData(keeperOfTheObservations: ObservationKeeper) {
        let quads: RDF.Quad[] = [];
        console.log("all hail the keeper of the observations");
        console.log("de grootte van de featureOfInterests: "+keeperOfTheObservations.featureOfInterests.size);
        for (let idSimpleValue of keeperOfTheObservations.simpleValues.keys()) {
            console.log("de is van de simplevalue is"+idSimpleValue);
            for (let idLocation of keeperOfTheObservations.simpleValues.get(idSimpleValue).keys()) {
                this.createFeatureOfInterest(keeperOfTheObservations.featureOfInterests.get(idLocation), quads);
                for(let observation of keeperOfTheObservations.simpleValues.get(idSimpleValue).get(idLocation)){
                    this.createObservation(observation,quads);
                    //hier wegschrijven naar de juiste file
                }
            }
        }
    }

    public createFeatureOfInterest(feature: FeatureOfInterest, quads: RDF.Quad[]): void {
        console.log(feature.getId());
    }

    public createObservation(observation: Observation, quads: RDF.Quad[]): void {

    }
}