import { ObservationKeeper } from "./Objects/ObservationKeeper";
import * as RDF from 'rdf-js';
import { FeatureOfInterest } from "./Objects/FeatureOfInterest";
import { Observation } from "./Objects/Observation";
import { literal, namedNode, quad, blankNode } from '@rdfjs/data-model';
import * as fs from "fs";
import { IConfig } from "./config";
import { SortedMap } from "collections/sorted-map";
const N3 = require('n3');

export class QuadTheCreator {
    private config: IConfig;
    constructor(config: IConfig) {
        this.config = config;
    }


    public async writeData(keeperOfTheObservations: ObservationKeeper, config: IConfig) {
        let quads: RDF.Quad[];
        const writer = new N3.Writer({ format: 'N-Triples' });

        for (let idSimpleValue of keeperOfTheObservations.simpleValues.keys()) {
            let simpleValueID = idSimpleValue.substring(idSimpleValue.lastIndexOf('/') + 1);
            for (let day of keeperOfTheObservations.simpleValues.get(idSimpleValue).keys()) {
                for (let idLocation of keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).keys()) {
                    quads = [];
                    let idLocationFile = idLocation.substring(idLocation.lastIndexOf('/') + 1);
                    idLocationFile = await idLocation.replace(/ /g, "_").replace(/\//g, '_').replace(/[^a-zA-Z]/g, "");
                    let dayFile = await day.replace(/ /g, "_");



                    // check if directory does not exist
                    if (!fs.existsSync(`${this.config.storage}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`${this.config.storage}`);
                    }
                    if (!fs.existsSync(`${this.config.storage}/${simpleValueID}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`${this.config.storage}/${simpleValueID}`);
                    }
                    if (!fs.existsSync(`${this.config.storage}/${simpleValueID}/${idLocationFile}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`${this.config.storage}/${simpleValueID}/${idLocationFile}`);
                    }
                    if (!fs.existsSync(`${this.config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`${this.config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`);
                    }

                    let baseURL = `${this.config.gh_pages_url}${this.config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`;

                    this.createObservation(keeperOfTheObservations, idSimpleValue, day, idLocation, quads, baseURL);
                    // check if file not exists
                    if (!fs.existsSync(`${this.config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}/${idLocationFile}.ttl`)) {
                        // make file where we will store newly fetched data     

                        let serialised = await writer.quadsToString(quads);

                        await fs.writeFileSync(`${this.config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}/${idLocationFile}.ttl`, serialised);
                    }
                }
            }
        }
    }

    public createObservation(keeperOfTheObservations: ObservationKeeper, idSimpleValue: string, day: string, idLocation: string, quads: RDF.Quad[], baseURL: string): void {
        let sortedMap = keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).get(idLocation);

        //specifications ldes
        quads.push(
            quad(
                namedNode(baseURL),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/ldes#EventStream')
            )
        );

        //pav:derivedFrom
        quads.push(
            quad(
                namedNode(baseURL),
                namedNode('http://purl.org/pav/derivedFrom'),
                namedNode(this.config.url)
            )
        );

        //createdWith
        quads.push(
            quad(
                namedNode(baseURL),
                namedNode('http://purl.org/pav/createdWith'),
                namedNode(this.config.gh_repository)
            )
        );

        //de tree:view
        //zeker opzoeken dit is fout
        quads.push(
            quad(
                namedNode(baseURL),
                namedNode('https://w3id.org/tree#view'),
                namedNode('?page=1')
            )
        );

        //member

        //  <A> a sosa:Observation, ifc:RegularTimeSeries;
        quads.push(
            quad(
                blankNode('A'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('http://www.w3.org/ns/sosa/Observation')
            )
        );
        quads.push(
            quad(
                blankNode('A'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcRegularTimeSeries')
            )
        );

        //  sosa:hasfeatureOfInterest <https://blue-bike.be/stations/103>;
        quads.push(
            quad(
                blankNode('A'),
                namedNode('http://www.w3.org/ns/sosa/hasFeatureOfInterest'),
                namedNode(keeperOfTheObservations.featureOfInterests.get(idLocation))
            )
        );

        //  sosa:observedProperty <https://w3id.org/gbfs#docks_in_use>;
        quads.push(
            quad(
                blankNode('A'),
                namedNode('http://www.w3.org/ns/sosa/observedProperty'),
                namedNode(idSimpleValue)
            )
        );
        //  ifc:timeStep [
        //   a ifc:IfcTimeMeasure;
        //   time:seconds "3".
        //   ];
        //  ifc:startTime [
        //   a ifc:ifcDateTime;
        //   ifcSimpleValue "2017-04-15T00:00:00+00:00".
        //   ];
        //  ifc:endTime [
        //   a ifc:ifcDateTime;
        //   ifc:ifcSimpleValue "2017-04-16T00:00:00+00:00".
        //   ];
        //  ifc:values [
        //   a ifc:ifcTimeSeriesList;
        //   <http://purl.org/co/size> "2";
        //   ifc:IfcValue ("12", "11", "23", "459", ... ).
        //  ].



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