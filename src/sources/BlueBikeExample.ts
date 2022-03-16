import type * as RDF from 'rdf-js';
import { ASource } from './ASource';
import { Page } from "./Page";
import { newEngine } from '@treecg/actor-init-ldes-client';
import { Observation } from '../lib/Observation';
import { FeatureOfInterest } from '../lib/FeatureOfInterest';

export class BlueBikeExample extends ASource {
    //private triples: RDF.Quad[];
    //private metadata:RDF.Quad[];   

    constructor() {
        super();
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

                eventStreamSync.on('data', (member: any) => {
                    //het is hier ook met Quads wnat ik heb die representation zo ingesteld
                    console.log(member.id.value);
                    //console.log(memberURI);
                    this.analyseData(member.quads);
                    //console.log(quads);
                });
                eventStreamSync.on('end', () => {
                    console.log("No more data!");
                    this.controle();
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
        let created: string;
        let name: string;
        let latitude: number;
        let longitude: number;
        let available: number;
        let inUse: number;
        member.forEach((x) => {
            //ik ga dit een string laten want die micro-seconden zijn super belangrijk
            //parsen naar data kan voor problemen zorgen want
            //omzetten naar new Date(...) en daarna date.toISOString() doet er een uur bij!!!
            switch (x.predicate.value) {
                case "http://purl.org/dc/terms/created": {
                    console.log("created on:\t" + x.object.value);
                    created = x.object.value;
                    console.log("dubbelcheck on the date:\t" + created.toString());
                    break;
                }
                case "http://schema.org/name": {
                    console.log("naam van het station:\t" + x.object.value);
                    name = x.object.value;
                    break;
                }
                case "http://www.w3.org/2003/01/geo/wgs84_pos#latitude": {
                    //console.log("de latitude is:\t" + x.object.value);
                    latitude = parseFloat(x.object.value);
                    break;
                }
                case "http://www.w3.org/2003/01/geo/wgs84_pos#longitude": {
                    //console.log("de longitude is:\t" + x.object.value);
                    longitude = parseFloat(x.object.value);
                    break;
                }
                case "https://w3id.org/gbfs#bikes_available": {
                    //console.log("aantal fietsen available:\t" + x.object.value);
                    available = parseFloat(x.object.value);
                    break;
                }
                case "https://w3id.org/gbfs#docks_in_use": {
                    //console.log("aantal docks in use?\t" + x.object.value);
                    inUse = parseFloat(x.object.value);
                    break;
                }

            }

        });
        //controleren of de featureOfInterest al bestaat
        if (!this.keeperOfTheObservations.featureOfInterests.has(name)) {
            //heeft de key nog niet
            let feature = new FeatureOfInterest(longitude, latitude, name);
            this.keeperOfTheObservations.addFeatureOfInterest(feature);

        }

        //dit wil zeggen dat de FeatureOfInterest dus wel al bestaat
        let availableObservation = new Observation(created, available);
        let inUseObservation = new Observation(created, inUse);
        if (availableObservation.isUsable()) {
            this.keeperOfTheObservations.addSimpleValue("available", name, availableObservation);
        }
        if (inUseObservation.isUsable()) {
            this.keeperOfTheObservations.addSimpleValue("inUse", name, inUseObservation);
        }

        console.log("\n");

    }

    public controle(): void {
        for (let x of this.keeperOfTheObservations.simpleValues.keys()) {
            console.log(x);
            for (let y of this.keeperOfTheObservations.simpleValues.get(x).keys()) {
                console.log("\t-\t" + y);
                for (let z of this.keeperOfTheObservations.simpleValues.get(x).get(y)) {
                    console.log("\t-\t-\t" + z.toString());
                }
            }
        }
    }
}