import { ObservationKeeper } from "./Objects/ObservationKeeper";
import * as RDF from 'rdf-js';
import { FeatureOfInterest } from "./Objects/FeatureOfInterest";
import { Observation } from "./Objects/Observation";
import { literal, namedNode, quad } from '@rdfjs/data-model';
import * as fs from "fs";
import { IConfig } from "./config";
import { SortedMap } from "collections/sorted-map";
const N3 = require('n3');

export class QuadTheCreator {
    constructor() {
        console.log("Quad the creator has started");
    }

    public async writeData(keeperOfTheObservations: ObservationKeeper, config: IConfig) {
        let quads: RDF.Quad[];
        let i: number;
        const writer = new N3.Writer({ format: 'N-Triples' });
        console.log("all hail the keeper of the observations");
        console.log("de grootte van de featureOfInterests: " + keeperOfTheObservations.featureOfInterests.size);
        for (let idSimpleValue of keeperOfTheObservations.simpleValues.keys()) {
            i = idSimpleValue.search(/#/);
            let simpleValueID = idSimpleValue.substring(i + 1);
            for (let day of keeperOfTheObservations.simpleValues.get(idSimpleValue).keys()) {
                for (let idLocation of keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).keys()) {
                    quads = [];
                    let idLocationFile = await idLocation.replace(/ /g, "_").replace(/\//g, '_').replace(/[^a-zA-Z]/g, "");
                    let dayFile = await day.replace(/ /g, "_");
                    //this.createFeatureOfInterest(keeperOfTheObservations.featureOfInterests.get(idLocation), quads);
                    for (let observation of keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).get(idLocation).keys()) {
                        this.createObservation(observation,idSimpleValue, quads);
                    }
                    //hier wegschrijven naar de juiste file


                    // check if directory does not exist
                    if (!fs.existsSync(`${config.storage}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`${config.storage}`);
                    }
                    if (!fs.existsSync(`${config.storage}/${simpleValueID}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`${config.storage}/${simpleValueID}`);
                    }
                    if (!fs.existsSync(`${config.storage}/${simpleValueID}/${idLocationFile}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`${config.storage}/${simpleValueID}/${idLocationFile}`);
                    }
                    if (!fs.existsSync(`${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`);
                    }


                    // check if file not exists
                    if (!fs.existsSync(`${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}/${idLocationFile}.ttl`)) {
                        // make file where we will store newly fetched data     

                        let serialised = await writer.quadsToString(quads);

                        await fs.writeFileSync(`${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}/${idLocationFile}.ttl`, serialised);
                    }
                }
            }
        }
    }

    // public createFeatureOfInterest(feature: FeatureOfInterest, quads: RDF.Quad[]): void {
    //     // ik beslis dat de url is

    //     let starturl = "https://blue-bike.be/stations/" + feature.getId().replace(/ /g, '_').replace(/\//g, '_');
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    //             namedNode('http://www.w3.org/ns/sosa/FeatureOfInterest')
    //         )
    //     );
    //     let date: Date = new Date();
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode('http://purl.org/dc/terms/created'),
    //             literal(date.toISOString())
    //         )
    //     );
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode('http://schema.org/name'),
    //             literal(feature.getId())
    //         )
    //     );
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode('http://www.w3.org/2003/01/geo/wgs84_pos#latitude'),
    //             literal(feature.getLatitude().toString())
    //         )
    //     );
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode('http://www.w3.org/2003/01/geo/wgs84_pos#longitude'),
    //             literal(feature.getLongitude().toString())
    //         )
    //     );
    // }

    // public createObservation(observation: Observation, idSimpleValue: string, idLocation: string, quads: RDF.Quad[]): void {
    //     let starturl: string = "https://blue-bike.be/" + idLocation.replace(/ /g, "_").replace(/\//g, '_') + "/observations/" + observation.getTimestamp()
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    //             namedNode('http://www.w3.org/ns/sosa/Observation')
    //         )
    //     );
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode('http://www.w3.org/ns/sosa/hasFeatureOfInterest'),
    //             namedNode('https://blue-bike.be/stations/' + idLocation.replace(/ /g, "_").replace(/\//g, '_'))
    //         )
    //     );
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode(idSimpleValue),
    //             literal(observation.getValue().toString())
    //         )
    //     );
    //     quads.push(
    //         quad(
    //             namedNode(starturl),
    //             namedNode('http://www.w3.org/ns/sosa/resultTime'),
    //             literal(observation.getTimestamp())
    //         )
    //     );
    // }

    public createObservation(sortedMap: SortedMap, idSimpleValue:string, quads: RDF.Quad[]): void {
        for (let key of sortedMap.keys()) {
            let starturl: string = "https://blue-bike.be/observations/" + key;
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
                    namedNode(idSimpleValue),
                    literal(sortedMap.get(key).toString())
                )
            );

        }
    }
}