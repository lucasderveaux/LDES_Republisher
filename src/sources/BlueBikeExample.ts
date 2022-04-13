import type * as RDF from 'rdf-js';
import { ASource } from './ASource';
import { Page } from "../Objects/Page";
import { newEngine } from '@treecg/actor-init-ldes-client';
import { Observation } from '../Objects/Observation';
import { FeatureOfInterest } from '../Objects/FeatureOfInterest';
import { ObservationKeeper } from '../Objects/ObservationKeeper';
var fs = require('fs');

export class BlueBikeExample extends ASource {
    //private triples: RDF.Quad[];
    //private metadata:RDF.Quad[];   

    constructor(keeperOfTheObservations: ObservationKeeper) {
        super(keeperOfTheObservations);
        
        //Hier zou nog vanalles kunnen komen in het verband met triples en metadat.
        //Misschien moet ik terug met Pages werken want eigenlijk was dat wel een goed systeem.
        //Ja ik ga dat doen dat is super logisch.

    }



    getPage(): Page {
        return null;
    }

    public async getData(): Promise<void> {
        //let url ="https://www.pieter.pm/Blue-Bike-to-Linked-GBFS/history/20220315T075514.ttl";
        let start = Date.now();

        return new Promise<void>((resolve, reject) => {
            try {
                let options = {
                    emitMemberOnce: true,
                    disablePolling: true,
                    mimeType: 'application/ld+json',
                    representation: "Quads",
                };

                let LDESClient = newEngine();
                let eventStreamSync = LDESClient.createReadStream(
                    //"https://www.pieter.pm/Blue-Bike-to-Linked-GBFS/history/20220315T075514.ttl",
                    "https://www.pieter.pm/Blue-Bike-to-Linked-GBFS/root.ttl",
                    options
                );

                eventStreamSync.on('data', async (member: any) => {
                    //het is hier ook met Quads wnat ik heb die representation zo ingesteld
                    //console.log(member.id.value);
                    //console.log(member.quads);
                    //console.log(memberURI);

                    await this.analyseData(member.quads);
                });
                eventStreamSync.on('end', () => {
                    console.log("No more data!");
                    console.log("totale tijd: \t" + ((Date.now() - start) / 1000) + " seconden");
                    // this.controle();
                    //this.controleNaam();
                    return resolve();
                });
            } catch (e) {
                console.error(e);
                // this.controle();

                return reject(e);
            }
        });

    }

    public async analyseData(member: RDF.Quad[]): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                //eerst kijkt die of dat de featureOfInterest al bestaat
                let created: string;
                let name: string;
                let latitude: number;
                let longitude: number;
                let available: number;
                let inUse: number;
                member.forEach((triple) => {
                    //ik ga dit een string laten want die micro-seconden zijn super belangrijk
                    //parsen naar data kan voor problemen zorgen want
                    //omzetten naar new Date(...) en daarna date.toISOString() doet er een uur bij!!!
                    switch (triple.predicate.value) {
                        case "http://purl.org/dc/terms/created": {
                            //console.log("created on:\t" + triple.object.value);
                            created = triple.object.value;
                            //console.log("dubbelcheck on the date:\t" + created.toString());
                            break;
                        }
                        case "http://schema.org/name": {
                            //console.log("naam van het station:\t" + triple.object.value);
                            name = triple.object.value;
                            break;
                        }
                        case "http://www.w3.org/2003/01/geo/wgs84_pos#latitude": {
                            //console.log("de latitude is:\t" + x.object.value);
                            latitude = parseFloat(triple.object.value);
                            break;
                        }
                        case "http://www.w3.org/2003/01/geo/wgs84_pos#longitude": {
                            //console.log("de longitude is:\t" + x.object.value);
                            longitude = parseFloat(triple.object.value);
                            break;
                        }
                        case "https://w3id.org/gbfs#bikes_available": {
                            //console.log("aantal fietsen available:\t" + x.object.value);
                            available = parseFloat(triple.object.value);
                            break;
                        }
                        case "https://w3id.org/gbfs#docks_in_use": {
                            //console.log("aantal docks in use?\t" + x.object.value);
                            inUse = parseFloat(triple.object.value);
                            break;
                        }

                    }

                });
                //controleren of alle waarden aangevuld zijn
                //enkel relevante informatie uit LDES halen
                if (created && name && latitude && longitude && available && inUse) {
                    //controleren of de featureOfInterest al bestaat
                    if (!this.keeperOfTheObservations.featureOfInterests.has(name)) {
                        //heeft de key nog niet
                        let feature = await new FeatureOfInterest(longitude, latitude, name);
                        //werkt neit meer -> this.keeperOfTheObservations.addFeatureOfInterest(feature);

                    }

                    //dit wil zeggen dat de FeatureOfInterest dus wel al bestaat
                    let availableObservation = new Observation(created, available);
                    let inUseObservation = new Observation(created, inUse);
                    if (availableObservation.isUsable()) {
                       // this.keeperOfTheObservations.addSimpleValue("https://w3id.org/gbfs#bikes_available", name, availableObservation);
                    }
                    if (inUseObservation.isUsable()) {
                      //  this.keeperOfTheObservations.addSimpleValue("https://w3id.org/gbfs#docks_in_use", name, inUseObservation);
                    }
                }

                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    public controle(): void {
        for (let w of this.keeperOfTheObservations.simpleValues.keys()) {
            // dit zijn er twee
            console.log(w);
            for (let x of this.keeperOfTheObservations.simpleValues.get(w).keys()) {
                console.log("\t-\t" + x);
                for (let y of this.keeperOfTheObservations.simpleValues.get(w).get(x).keys()) {
                    console.log("\t\t\t" + y);
                    for (let z of this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y)) {
                        console.log("\t\t\t\t" + z.toString());
                    }
                }
            }
        }
    }

    public controleNaam() {
        let mijnSet = new Set();
        let dagenSet = new Set();

        for (let idSimpleValue of this.keeperOfTheObservations.simpleValues.keys()) {

            for (let day of this.keeperOfTheObservations.simpleValues.get(idSimpleValue).keys()) {
                for (let idLocation of this.keeperOfTheObservations.simpleValues.get(idSimpleValue).get(day).keys()) {

                    mijnSet.add(idLocation.replace(/ /g, "_").replace(/\//g, '_'));
                    dagenSet.add(day.replace(/ /g, "_"));
                }
            }
        }

        let str: string = "";
        for (let plek of mijnSet) {
            str += plek + '\n';
        }

        let str2: string = "";
        for (let dag of dagenSet) {
            str2 += dag + "\n";
        }

        fs.writeFileSync('./stations.txt', (str), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("file saved");
            }
        });

        fs.writeFileSync('./dagen.txt', (str2), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("file saved");
            }
        });
    }
}