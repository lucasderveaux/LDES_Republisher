import { ObservationKeeper } from "./Objects/ObservationKeeper";
import * as RDF from 'rdf-js';
import { literal, namedNode, quad, blankNode } from '@rdfjs/data-model';
import * as fs from "fs";
import { IConfig } from "./config";
import { SortedMap } from "collections/sorted-map";
const N3 = require('n3');

export class DataWriter {

    constructor() {

    }


    public async writeData(keeperOfTheObservations: ObservationKeeper, config: IConfig) {
        let quads: RDF.Quad[];
        const writer = new N3.Writer({ format: 'N-Triples' });

        for (let idSimpleValue of keeperOfTheObservations.simpleValues.keys()) {
            let simpleValueID = idSimpleValue.substring(idSimpleValue.lastIndexOf('/') + 1);
            simpleValueID = simpleValueID.replace(/#/g,"");
            for (let day of keeperOfTheObservations.simpleValues.get(idSimpleValue).keys()) {
                for (let idLocation of keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).keys()) {
                    quads = [];

                    let idLocationFile = "";

                    //if idlocation is an url
                    let urlTESt = idLocation.match(/\.[a-zA-z]+\/(.*)/);
                    if (urlTESt != null) {
                        idLocationFile = urlTESt[1];
                    } else {
                        idLocationFile = idLocation.substring(idLocation.lastIndexOf('\.[a-zAz]/') + 1);
                    }

                    idLocationFile = await idLocationFile.replace(/ /g, "_").replace(/\//g, '_').replace(/[^a-zA-Z]/g, "").replace(/#/g,"");
                    let dayFile = await day.replace(/ /g, "_").replace(/#/g,"");



                    // check if directory does not exist
                    if (!fs.existsSync(`public`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public`);
                    }
                    // check if directory does not exist
                    if (!fs.existsSync(`public/${config.storage}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public/${config.storage}`);
                    }
                    if (!fs.existsSync(`public/${config.storage}/${simpleValueID}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public/${config.storage}/${simpleValueID}`);
                    }
                    if (!fs.existsSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}`);
                    }
                    if (!fs.existsSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`)) {
                        //console.log('Directory not existing!');
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`);
                    }

                    let baseURL = `${config.gh_pages_url}${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}/${idLocationFile}.ttl`;

                    this.createObservation(keeperOfTheObservations, idSimpleValue, day, idLocation, quads, baseURL,config);
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

    private createObservation(keeperOfTheObservations: ObservationKeeper, idSimpleValue: string, day: string, idLocation: string, quads: RDF.Quad[], baseURL: string,config:IConfig): void {
        let sortedMap: SortedMap = keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).get(idLocation);

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
                namedNode(config.url)
            )
        );

        //createdWith
        quads.push(
            quad(
                namedNode(baseURL),
                namedNode('http://purl.org/pav/createdWith'),
                namedNode(config.gh_repository)
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

        let size = sortedMap.length;
        let seconds = (24 * 60 * 60) / size;

        //  ifc:timeStep [
        quads.push(
            quad(
                blankNode('A'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#timeStep_IfcRegularTimeSeries'),
                blankNode('seconds')
            )
        );
        //   a ifc:IfcTimeMeasure;
        quads.push(
            quad(
                blankNode('seconds'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcTimeMeasure')
            )
        );
        //   time:seconds "3".
        quads.push(
            quad(
                blankNode('seconds'),
                namedNode('https://www.w3.org/2006/time#seconds'),
                literal(seconds.toString(), "https://www.w3.org/2001/XMLSchema#float")
            )
        );
        //   ];
        //  ifc:startTime [
        quads.push(
            quad(
                blankNode('A'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#startTime_IfcWorkControl'),
                blankNode('startTime')
            )
        );
        //   a ifc:ifcDateTime;
        quads.push(
            quad(
                blankNode('startTime'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcDateTime')
            )
        );
        //   ifcSimpleValue "2017-04-15T00:00:00+00:00".
        quads.push(
            quad(
                blankNode('startTime'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcSimpleValue'),
                literal(day, 'http://www.w3.org/2001/XMLSchema#dateTime')
            )
        );
        //   ];
        //  ifc:endTime [
        quads.push(
            quad(
                blankNode('A'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#startTime_IfcWorkControl'),
                blankNode('endTime')
            )
        );
        //   a ifc:ifcDateTime;
        quads.push(
            quad(
                blankNode('endTime'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcDateTime')
            )
        );
        //   ifcSimpleValue "2017-04-16T00:00:00+00:00".
        quads.push(
            quad(
                blankNode('endTime'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcSimpleValue'),
                literal(day, 'http://www.w3.org/2001/XMLSchema#dateTime')
            )
        );
        //   ];
        //  ifc:values [
        quads.push(
            quad(
                blankNode('A'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#values_IfcStructuralLoadConfiguration'),
                blankNode('timeSeriesList')
            )
        );
        //   a ifc:ifcTimeSeriesList;
        quads.push(
            quad(
                blankNode('timeSeriesList'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcTimeSeriesValue_List')
            )
        );
        //   <http://purl.org/co/size> "2";
        quads.push(
            quad(
                blankNode('timeSeriesList'),
                namedNode('http://purl.org/co/size'),
                literal(size, 'https://www.w3.org/2001/XMLSchema#integer')
            )
        );
        //   ifc:IfcValue ("12", "11", "23", "459", ... ).
        let i = 0;
        let vorige: string;

        for (let key of sortedMap.keys()) {
            //is de eerste in de rij
            if (i != 0) {
                quads.push(
                    quad(
                        blankNode(vorige),
                        namedNode('https://w3id.org/list#isFollowedBy'),
                        blankNode('list' + Math.round(key).toString())
                    )
                )
                i++;
            }
            i++;
            //anders
            quads.push(
                quad(
                    blankNode('timeSeriesList'),
                    namedNode('https://w3id.org/list#hasNext'),
                    blankNode('list' + Math.round(key).toString())
                )
            );

            quads.push(
                quad(
                    blankNode('list' + Math.round(key).toString()),
                    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                    namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcTimeSeriesValue_List')
                )
            );
            quads.push(
                quad(
                    blankNode('list' + Math.round(key).toString()),
                    namedNode('https://w3id.org/list#hasContents'),
                    blankNode('value' + i)
                )
            );

            quads.push(
                quad(
                    blankNode('value' + i),
                    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                    namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcSimpleValue')
                )
            );

            quads.push(
                quad(
                    blankNode('value' + i),
                    namedNode(idSimpleValue),
                    literal(sortedMap.get(key).toString())
                )
            );
            vorige = 'list' + Math.round(key).toString();
        }

        quads.push(
            quad(
                blankNode(vorige),
                namedNode('https://w3id.org/list#isFollowedBy'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
            )
        )

        quads.push(
            quad(
                blankNode('timeSeriesList'),
                namedNode('https://w3id.org/list#hasNext'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
            )
        );
        // <https://github.com/lucasderveaux/LinkedDataExtractor>
        //    a fno:Function;
        quads.push(
            quad(
                namedNode(config.gh_repository),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('fno:FUNCTION')
            )
        );
        //    dcterms:description "This function.....";
        //    fno:expects (
        //           [fno:predicate sosa:observedProperty; fno:type xsd:anyURI; fno:required true]
        //           [fno:predicate sosa:hasFeatureOfInterest; fno:type xsd:anyURI; fno:required true]
        //           [fno:predicate pav:derivedFrom; fno:type xsd:anyURI; fno:required true]
        //           );
        //    fno:implements _AlgorithmPAA;
    }
}

