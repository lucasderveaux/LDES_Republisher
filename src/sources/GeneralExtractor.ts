import { Page } from '../Objects/Page';
import { ASource } from './ASource';
import { IConfig } from '../config';
import { ObservationKeeper } from '../Objects/ObservationKeeper';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type * as RDF from 'rdf-js';
import { Observation } from '../Objects/Observation';


export class GeneralExtractor extends ASource {
    private config: IConfig;
    private literal_values: string[];
    private url: string;

    constructor(keeperOfTheObservations: ObservationKeeper, config: IConfig) {
        super(keeperOfTheObservations);
        this.config = config;
        this.literal_values = JSON.parse(this.config.literal_values);
        
        //test
       // this.literal_values = ["https://w3id.org/gbfs#bikes_available", "https://w3id.org/gbfs#docks_in_use"];
        //this.url = "https://www.pieter.pm/Blue-Bike-to-Linked-GBFS/history/20220315T075514.ttl";
        //test

    }

    public getData(): Promise<void> {

        return new Promise<void>((resolve, reject) => {
            try {
                let options = {
                    emitMemberOnce: true,
                    disablePolling: true,
                    mimeType: 'application/ld+json',
                    representation: 'Quads'
                };

                let LDESClient = newEngine();

                let eventStreamSync = LDESClient.createReadStream(

                    this.config.url, options
                    // //test
                    //this.url, options
                    // //test

                );

                eventStreamSync.on('data', async (member: any) => {
                    await this.analyseData(member.quads);
                });

                eventStreamSync.on('end', () => {
                    console.log('No more data!');

                     this.controle();

                    return resolve();
                });
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    private async analyseData(member: RDF.Quad[]): Promise<void> {

        return new Promise<void>(async (resolve, reject) => {
            try {
                let version: string;
                let name: string;
                let literal: number;
                let created: string;
                let observations = new Map<string, number>();

                member.forEach((triple) => {
                    if (this.literal_values.includes(triple.predicate.value)) {
                        observations.set(triple.predicate.value, parseFloat(triple.object.value));
                    } else {
                        switch (triple.predicate.value) {
                            case this.config.url_feature_of_interest: {
                                console.log("created on:\t" + triple.object.value);
                                version = triple.object.value;
                                //console.log("dubbelcheck on the date:\t" + created.toString());
                                break;
                            }
                            case "http://schema.org/name": {
                                //console.log("naam van het station:\t" + triple.object.value);
                                name = triple.object.value;
                                break;
                            }
                            case this.config.url_timestamp: {
                                console.log("created on:\t" + triple.object.value);
                                created = triple.object.value;
                                //console.log("dubbelcheck on the date:\t" + created.toString());
                                break;
                            }
                        }
                    }
                });
                if (version && created) {
                    if (!name) {
                        name = version;
                    } 


                        for (let key of observations.keys()) {

                            if (observations.get(key)) {
                                this.keeperOfTheObservations.addSimpleValue(key, name, created, observations.get(key));
                            }
                        }

                        this.keeperOfTheObservations.addFeatureOfInterest(name, version);
                    

                }

                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }

        });

    }

    public controle(): void {
        console.log("huh");
        console.log(this.config.url_feature_of_interest);
        console.log(this.config.url_timestamp);
        for (let w of this.keeperOfTheObservations.simpleValues.keys()) {
            // dit zijn de types
            console.log(w);
            for (let x of this.keeperOfTheObservations.simpleValues.get(w).keys()) {
                //dit zijn de dagen
                console.log("\t-\t" + x);
                for (let y of this.keeperOfTheObservations.simpleValues.get(w).get(x).keys()) {
                    //dit zijn de stations
                    console.log("\t\t\t" + y);

                    for (let z of this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y).keys()) {
                        //dit is de sortedMap
                        console.log("\t\t\t\t" + z + ":\t" + this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y).get(z));
                    }
                    //console.log("\t\t\t\t"+this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y).length);
                }
            }
        }
    }


    public getPage(id: any): Page {
        throw new Error('Method not implemented.');
    }
}