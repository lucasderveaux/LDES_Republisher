import { ObservationKeeper } from "./lib/ObservationKeeper";
import type * as RDF from 'rdf-js';
import { FeatureOfInterest } from "./lib/FeatureOfInterest";
import { Observation } from "./lib/Observation";
import { literal, namedNode, quad } from '@rdfjs/data-model';
import * as fs from "fs";
const N3 = require('n3');

export class QuadTheCreator {
    constructor() {
        console.log("Quad the creator has started");
    }

    public writeData(keeperOfTheObservations: ObservationKeeper) {
        let quads: RDF.Quad[];
        let i: number;

        console.log("all hail the keeper of the observations");
        console.log("de grootte van de featureOfInterests: " + keeperOfTheObservations.featureOfInterests.size);
        for (let idSimpleValue of keeperOfTheObservations.simpleValues.keys()) {
            console.log("de is van de simplevalue is" + idSimpleValue);
            i = idSimpleValue.search(/#/);
            let test = idSimpleValue.substring(i + 1);
            console.log(test);
            for (let idLocation of keeperOfTheObservations.simpleValues.get(idSimpleValue).keys()) {
                quads = [];
                this.createFeatureOfInterest(keeperOfTheObservations.featureOfInterests.get(idLocation), quads);
                for (let observation of keeperOfTheObservations.simpleValues.get(idSimpleValue).get(idLocation)) {
                    this.createObservation(observation, idSimpleValue, idLocation, quads);
                }
                //hier wegschrijven naar de juiste file
                // check if directory does not exist
                if (!fs.existsSync("output")) {
                    //console.log('Directory not existing!');
                    // make directory where we will store newly fetched data
                    fs.mkdirSync("output");
                }
                if (!fs.existsSync("output/"+test)) {
                    //console.log('Directory not existing!');
                    // make directory where we will store newly fetched data
                    fs.mkdirSync("output/"+test);
                }

                // check if file not exists
                if (!fs.existsSync("output/"+test + "/" + idLocation.substring(8).replace(/ /g, "_").replace(/\//g,'_')+ ".ttl")) {
                    // make file where we will store newly fetched data     
                    const writer = new N3.Writer({ format: 'N-Triples' });
                    let serialised = writer.quadsToString(quads);

                    fs.writeFileSync("output/"+test + "/" + idLocation.substring(8).replace(/ /g, "_").replace(/\//g,'_') + ".ttl", serialised);
                }
            }
        }
    }

    public createFeatureOfInterest(feature: FeatureOfInterest, quads: RDF.Quad[]): void {
        // ik beslis dat de url is
        let starturl = "https://blue-bike.be/stations/" + feature.getId().substring(8).replace(/ /g, '_').replace(/\//g,'_');
        quads.push(
            quad(
                namedNode(starturl),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('http://www.w3.org/ns/sosa/FeatureOfInterest')
            )
        );
        let date: Date = new Date();
        quads.push(
            quad(
                namedNode(starturl),
                namedNode('http://purl.org/dc/terms/created'),
                literal(date.toISOString())
            )
        );
        quads.push(
            quad(
                namedNode(starturl),
                namedNode('http://schema.org/name'),
                literal(feature.getId())
            )
        );
        quads.push(
            quad(
                namedNode(starturl),
                namedNode('http://www.w3.org/2003/01/geo/wgs84_pos#latitude'),
                literal(feature.getLatitude().toString())
            )
        );
        quads.push(
            quad(
                namedNode(starturl),
                namedNode('http://www.w3.org/2003/01/geo/wgs84_pos#longitude'),
                literal(feature.getLongitude().toString())
            )
        );
    }

    public createObservation(observation: Observation, idSimpleValue: string, idLocation: string, quads: RDF.Quad[]): void {
        let starturl: string = "https://blue-bike.be/" + idLocation.substring(8).replace(/ /g, "_").replace(/\//g,'_') + "observations/" + observation.getTimestamp()
        quads.push(
            quad(
                namedNode(starturl),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('http://www.w3.org/ns/sosa/Observation')
            )
        );
        quads.push(
            quad(
                namedNode(starturl),
                namedNode('http://www.w3.org/ns/sosa/hasFeatureOfInterest'),
                namedNode('https://blue-bike.be/stations/' + idLocation.substring(8).replace(/ /g, "_").replace(/\//g,'_'))
            )
        );
        quads.push(
            quad(
                namedNode(starturl),
                namedNode(idSimpleValue),
                literal(observation.getValue().toString())
            )
        );
        quads.push(
            quad(
                namedNode(starturl),
                namedNode('http://www.w3.org/ns/sosa/resultTime'),
                literal(observation.getTimestamp())
            )
        );
    }
}