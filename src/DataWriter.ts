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
        

        for (let idSimpleValue of keeperOfTheObservations.simpleValues.keys()) {
            // idSimpleValue is the type of the observation

            //simpleValueID is the type of the observation, but only looks at the last wordt within the given predicate
            let simpleValueID = idSimpleValue.substring(idSimpleValue.lastIndexOf('/') + 1);

            //simpleValueID without the character '#'
            simpleValueID = simpleValueID.replace(/#/g, "");
            for (let day of keeperOfTheObservations.simpleValues.get(idSimpleValue).keys()) {
                // the key is the string of the day the observation is made
                for (let idLocation of keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).keys()) {
                    // the idLocation is the name of the feature of interest or the uri of the feature of interest
                    quads = [];

                    let idLocationFile = "";

                    //if idlocation is a uri
                    let uriTESt = idLocation.match(/\.[a-zA-z]+\/(.*)/);
                    if (uriTESt != null) {
                        idLocationFile = uriTESt[1];
                    } else {
                        idLocationFile = idLocation.substring(idLocation.lastIndexOf('\.[a-zAz]/') + 1);
                    }

                    //replace all characters that can potentially ruin file names
                    idLocationFile = await idLocationFile.replace(/ /g, "_").replace(/\//g, '_').replace(/[^a-zA-Z]/g, "").replace(/#/g, "");
                    let dayFile = await day.replace(/ /g, "_").replace(/#/g, "");

                    // check if directory does not exist
                    if (!fs.existsSync(`public`)) {
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public`);
                    }
                    // check if directory does not exist
                    if (!fs.existsSync(`public/${config.storage}`)) {
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public/${config.storage}`);
                    }
                    if (!fs.existsSync(`public/${config.storage}/${simpleValueID}`)) {
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public/${config.storage}/${simpleValueID}`);
                    }
                    if (!fs.existsSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}`)) {
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}`);
                    }
                    if (!fs.existsSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`)) {
                        // make directory where we will store newly fetched data
                        await fs.mkdirSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}`);
                    }

                    //create baseURL
                    let baseURL = `${config.gh_pages_url}${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}/${idLocationFile}.ttl`;

                    this.createObservation(keeperOfTheObservations, idSimpleValue, day, idLocation, quads, baseURL, config);
                    // check if file not exists
                    if (!fs.existsSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}/${idLocationFile}.ttl`)) {
                        // make file where we will store newly fetched data     
                        let writer = new N3.Writer();
                        writer.addQuads(quads);
                        let final = "";
                        await writer.end((error, result) => {
                            final = result;
                          });

                        await fs.writeFileSync(`public/${config.storage}/${simpleValueID}/${idLocationFile}/${dayFile}/${idLocationFile}.ttl`, final);
                    }
                }
            }
        }
    }

    // function that creates an LDES out of a regular time series
    private createObservation(keeperOfTheObservations: ObservationKeeper, idSimpleValue: string, day: string, idLocation: string, quads: RDF.Quad[], baseURL: string, config: IConfig): void {
        // the sortedMap is collected here because all of the keys needed to collect the sortedMap needs to be used in the new LDES anyway
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
        quads.push(
            quad(
                namedNode(baseURL),
                namedNode('https://w3id.org/tree#view'),
                namedNode(baseURL)
            )
        );

        //member
        //  _A a sosa:Observation, ifc:RegularTimeSeries;
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
        if (size > 1) {
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
            let iterator = sortedMap.keys();
            let key1 = iterator.next().value
            let key2 = iterator.next().value;
            let seconds = (key2 - key1) / 1000;

            quads.push(
                quad(
                    blankNode('seconds'),
                    namedNode('https://www.w3.org/2006/time#seconds'),
                    literal(seconds.toString(), "https://www.w3.org/2001/XMLSchema#float")
                )
            );
        }
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
        let date = Date.parse(day);
        let date2 = date + 24 * 60 * 60 * 1000;
        let stringDate = new Date(date);
        let stringDate2 = new Date(date2);

        quads.push(
            quad(
                blankNode('startTime'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#IfcSimpleValue'),
                literal(stringDate.toLocaleString(), 'http://www.w3.org/2001/XMLSchema#dateTime')
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
                literal(stringDate2.toLocaleString(), 'http://www.w3.org/2001/XMLSchema#dateTime')
            )
        );
        //   ];
        //  ifc:values [
        quads.push(
            quad(
                blankNode('A'),
                namedNode('https://w3id.org/ifc/IFC4_ADD1#values_IfcRegularTimeSeries'),
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
                namedNode('https://w3id.org/function/ontology#function')
            )
        );
        //    dcterms:description "This function.....";
        quads.push(
            quad(
                namedNode(config.gh_repository),
                namedNode('http://purl.org/dc/terms/description'),
                literal('This function reads a given LDES en republishes it in a new Linked Data Event Stream grouped by type of observation, feature of interest and type of observation.')
            )
        );
        //    fno:expects (
        quads.push(
            quad(
                namedNode(config.gh_repository),
                namedNode('https://w3id.org/function/ontology#expects'),
                blankNode('expects')
            )
        );
        //           [fno:predicate sosa:observedProperty; fno:type xsd:anyURI; fno:required true]
        quads.push(
            quad(
                blankNode('expects'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/list#OWLList')
            )
        );
        quads.push(
            quad(
                blankNode('expects'),
                namedNode('https://w3id.org/list#hasNext'),
                blankNode('parameter1')
            )
        );
        quads.push(
            quad(
                blankNode('parameter1'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/function/ontology#Parameter')
            )
        );
        quads.push(
            quad(
                blankNode('parameter1'),
                namedNode('https://w3id.org/function/ontology#predicate'),
                namedNode('http://www.w3.org/ns/sosa/observedProperty')
            )
        );
        quads.push(
            quad(
                blankNode('parameter1'),
                namedNode('https://w3id.org/function/ontology#type'),
                namedNode('https://www.w3.org/2001/XMLSchema#anyURI')
            )
        );
        quads.push(
            quad(
                blankNode('parameter1'),
                namedNode('https://w3id.org/function/ontology#required'),
                literal('true', 'https://www.w3.org/2001/XMLSchema#boolean')
            )
        );
        quads.push(
            quad(
                blankNode('parameter1'),
                namedNode('https://w3id.org/list#isFollowedBy'),
                blankNode('parameter2')
            )
        );
        //           [fno:predicate sosa:hasFeatureOfInterest; fno:type xsd:anyURI; fno:required true]

        quads.push(
            quad(
                blankNode('expects'),
                namedNode('https://w3id.org/list#hasNext'),
                blankNode('parameter2')
            )
        );
        quads.push(
            quad(
                blankNode('parameter2'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/function/ontology#Parameter')
            )
        );
        quads.push(
            quad(
                blankNode('parameter2'),
                namedNode('https://w3id.org/function/ontology#predicate'),
                namedNode('http://www.w3.org/ns/sosa/hasFeatureOfInterest')
            )
        );
        quads.push(
            quad(
                blankNode('parameter2'),
                namedNode('https://w3id.org/function/ontology#type'),
                namedNode('https://www.w3.org/2001/XMLSchema#anyURI')
            )
        );
        quads.push(
            quad(
                blankNode('parameter2'),
                namedNode('https://w3id.org/function/ontology#required'),
                literal('true', 'https://www.w3.org/2001/XMLSchema#boolean')
            )
        );
        quads.push(
            quad(
                blankNode('parameter2'),
                namedNode('https://w3id.org/list#isFollowedBy'),
                blankNode('parameter3')
            )
        );
        //           [fno:predicate pav:derivedFrom; fno:type xsd:anyURI; fno:required true]
        quads.push(
            quad(
                blankNode('expects'),
                namedNode('https://w3id.org/list#hasNext'),
                blankNode('parameter3')
            )
        );
        quads.push(
            quad(
                blankNode('parameter3'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/function/ontology#Parameter')
            )
        );
        quads.push(
            quad(
                blankNode('parameter3'),
                namedNode('https://w3id.org/function/ontology#predicate'),
                namedNode('http://purl.org/pav/derivedFrom')
            )
        );
        quads.push(
            quad(
                blankNode('parameter3'),
                namedNode('https://w3id.org/function/ontology#type'),
                namedNode('https://www.w3.org/2001/XMLSchema#anyURI')
            )
        );
        quads.push(
            quad(
                blankNode('parameter3'),
                namedNode('https://w3id.org/function/ontology#required'),
                literal('true', 'https://www.w3.org/2001/XMLSchema#boolean')
            )
        );
        quads.push(
            quad(
                blankNode('parameter3'),
                namedNode('https://w3id.org/list#isFollowedBy'),
                blankNode('parameter4')
            )
        );
        //parameter4
        quads.push(
            quad(
                blankNode('expects'),
                namedNode('https://w3id.org/list#hasNext'),
                blankNode('parameter4')
            )
        );
        quads.push(
            quad(
                blankNode('parameter4'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/function/ontology#Parameter')
            )
        );
        quads.push(
            quad(
                blankNode('parameter4'),
                namedNode('https://w3id.org/function/ontology#predicate'),
                namedNode(config.uri_timestamp)
            )
        );
        quads.push(
            quad(
                blankNode('parameter4'),
                namedNode('https://w3id.org/function/ontology#type'),
                namedNode('https://www.w3.org/2001/XMLSchema#anyURI')
            )
        );
        quads.push(
            quad(
                blankNode('parameter4'),
                namedNode('https://w3id.org/function/ontology#required'),
                literal('true', 'https://www.w3.org/2001/XMLSchema#boolean')
            )
        );
        quads.push(
            quad(
                blankNode('parameter4'),
                namedNode('https://w3id.org/list#isFollowedBy'),
                blankNode('parameter5')
            )
        );
        //parameter5
        quads.push(
            quad(
                blankNode('expects'),
                namedNode('https://w3id.org/list#hasNext'),
                blankNode('parameter5')
            )
        );
        quads.push(
            quad(
                blankNode('parameter5'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/function/ontology#Parameter')
            )
        );
        quads.push(
            quad(
                blankNode('parameter5'),
                namedNode('https://w3id.org/function/ontology#predicate'),
                namedNode('http://purl.org/co/size')
            )
        );
        quads.push(
            quad(
                blankNode('parameter5'),
                namedNode('https://w3id.org/function/ontology#type'),
                namedNode('https://www.w3.org/2001/XMLSchema#anyURI')
            )
        );
        quads.push(
            quad(
                blankNode('parameter5'),
                namedNode('https://w3id.org/function/ontology#required'),
                literal('false', 'https://www.w3.org/2001/XMLSchema#boolean')
            )
        );
        quads.push(
            quad(
                blankNode('parameter5'),
                namedNode('https://w3id.org/list#isFollowedBy'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#nil')
            )
        );
        //           );
        //    fno:implements _AlgorithmPAA;
        quads.push(
            quad(
                namedNode(config.gh_repository),
                namedNode('https://w3id.org/function/ontology#implements'),
                blankNode('AlgorithmPAA')
            )
        );


        // _AlgorithmPAA
        //     a fno: Algortihm;
        quads.push(
            quad(
                blankNode('AlgorithmPAA'),
                namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
                namedNode('https://w3id.org/function/ontology#Algorithm')
            )
        );
        //     fno:name "Piecewise Aggregate Approximation" ^^ xsd: string;
        quads.push(
            quad(
                blankNode('AlgorithmPAA'),
                namedNode('https://w3id.org/function/ontology#name'),
                literal('Piecewise Aggregate Approximation', 'https://www.w3.org/2001/XMLSchema#string')
            )
        );
        //     fno:description "vanalles" ^^ xsd: string.
        quads.push(
            quad(
                blankNode('AlgorithmPAA'),
                namedNode('https://w3id.org/function/ontology#description'),
                literal('Piecewise Aggregate Approximation (PAA) is a very simple dimensionality reduction method for time series mining. It minimizes dimensionality by the mean values of equal sized frames.', 'https://www.w3.org/2001/XMLSchema#string')
            )
        );

    }
}

