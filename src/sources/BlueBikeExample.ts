import type * as RDF from 'rdf-js';
import { ISource } from './ISource';
import { Page } from "./Page";
import { newEngine } from '@treecg/actor-init-ldes-client';
import { Observation } from '../lib/Observation';

export class BlueBikeExample implements ISource {
    //private triples: RDF.Quad[];
    //private metadata:RDF.Quad[];   

    constructor() {
        //Hier zou nog vanalles kunnen komen in het verband met triples en metadat.
        //Misschien moet ik terug met Pages werken want eigenlijk was dat wel een goed systeem.
        //Ja ik ga dat doen dat is super logisch.
    }



    getPage(): Page {
        return null;
    }


    async getData(): Promise<Observation[]> {

        return new Promise<Observation[]>((resolve, reject) => {
            try {
                let options = {
                    emitMemberOnce: true,
                    disablePolling: true,
                    mimeType: 'application/ld+json',
                    representation: "Quads",
                };

                let LDESClient = newEngine();
                let eventStreamSync = LDESClient.createReadStream(
                    "https://www.pieter.pm/Blue-Bike-to-Linked-GBFS/history/20220315T075514.ttl",
                    options
                );

                let data: Observation[];

                let memberURI: any;
                let quads: RDF.Quad[];

                eventStreamSync.on('data', (member: any) => {
                    //console.log(member);
                    //het is hier ook met Quads wnat ik heb die representation zo ingesteld
                    console.log(member.id.value);
                    //console.log(memberURI);
                   this.analyseData(member.quads);
                    //console.log(quads);
                });
                eventStreamSync.on('end', () => {
                    console.log("No more data!");
                    //console.log(memberURI);
                    //console.log(quads);
                    
                    resolve(data);
                });
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });

    }

    public analyseData(member: RDF.Quad[]): void {
        //eerst kijkt die of dat de featureOfInterest al bestaat

        member.forEach((x) => {
            switch (x.predicate.value) {
                case "http://purl.org/dc/terms/created": {
                    console.log("created on:\t" + x.object.value);
                    break;
                }
                case "http://schema.org/name":{
                    console.log("naam van het station:\t"+x.object.value);
                    break;
                }
                case "http://www.w3.org/2003/01/geo/wgs84_pos#latitude":{
                    console.log("de latitude is:\t"+x.object.value);
                    break;
                }
                case "http://www.w3.org/2003/01/geo/wgs84_pos#longitude":{
                    console.log("de longitude is:\t"+x.object.value);
                    break;
                }
                case "https://w3id.org/gbfs#bikes_available":{
                    console.log("aantal fietsen available:\t"+x.object.value);
                    break;
                }
                case "https://w3id.org/gbfs#docks_in_use":{
                    console.log("aantal docks in use?\t"+x.object.value);
                    break;
                }

            }

        });
        console.log("\n");

        //CreateFeatureOfInterest
        //Longitude

        //latitude
        //id

        //dan kijkt die of dat de observation al bestaat

        //Observation
        //timestamp
        //value

    }

}