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
        let i: number;
        const writer = new N3.Writer({ format: 'N-Triples' });

        for (let idSimpleValue of keeperOfTheObservations.simpleValues.keys()) {
            i = idSimpleValue.search(/#/);
            let simpleValueID = idSimpleValue.substring(i + 1);
            for (let day of keeperOfTheObservations.simpleValues.get(idSimpleValue).keys()) {
                for (let idLocation of keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).keys()) {
                    quads = [];
                    let idLocationFile = await idLocation.replace(/ /g, "_").replace(/\//g, '_').replace(/[^a-zA-Z]/g, "");
                    let dayFile = await day.replace(/ /g, "_");



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

                    let baseURL = `${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`;

                    this.createObservation(keeperOfTheObservations, idSimpleValue, day, idLocation, quads, baseURL);
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
                blankNode('createdWith')
            )
        )

        /*
        pas op
        dit is allemaal speculation at this point
        14/04/2022
        */


        //blankNode specification
        //timeseriesWindowCreator
        quads.push(
            quad(
                blankNode('createdWith'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('http://example.org/TimeSeriesWindowCreator')
            )
        );

        //timeParameter
        quads.push(
            quad(
                blankNode('createdWith'),
                namedNode('http://example.org/timeparameter'),
                namedNode(' http://www.w3.org/ns/sosa/resultTime')
            )
        );

        //numberOfSamples
        quads.push(
            quad(
                blankNode('createdWith'),
                namedNode('http://example.org/numberOfSamples'),
                literal(sortedMap.length)
            )
        );

        //ex:duration
        quads.push(
            quad(
                blankNode('createdWith'),
                namedNode('http://example.org/duration'),
                literal('P24:00')
            )
        );

        //resultParameterPath
        quads.push(
            quad(
                blankNode('createdWith'),
                namedNode('http://example.org/resultParameterPath'),
                namedNode('GeenIdee')
            )
        );

        //featureOfInterestParameterPath
        quads.push(
            quad(
                blankNode('createdWith'),
                namedNode('http://example.org/featureOfInterestParameterPath'),
                namedNode('http://purl.org/dc/terms/isVersionOf')
            )
        );

        //de tree:view
        //zeker opzoeken dit is fout
        quads.push(
            quad(
                namedNode(baseURL),
                namedNode('https://w3id.org/tree#view'),
                namedNode(baseURL)
            )
        );

        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        //hier ben ik gestopt
        

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