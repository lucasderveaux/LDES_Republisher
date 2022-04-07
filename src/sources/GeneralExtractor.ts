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

    constructor(keeperOfTheObservations: ObservationKeeper, config: IConfig) {
        super(keeperOfTheObservations);
        this.config = config;
        this.literal_values = JSON.parse(this.config.literal_values);
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
                let literalPredicate: string;
                let created:string
                member.forEach((triple) => {
                    if (this.literal_values.includes(triple.predicate.value)) {
                        console.log(triple.predicate.value+" is de predicat");
                        literal = parseFloat(triple.object.value);
                        literalPredicate = triple.predicate.value;
                        console.log(literalPredicate+"\t:\t"+literal);
                    } else {
                        switch (triple.predicate.value) {
                            case "http://purl.org/dc/terms/isVersionOf": {
                                //console.log("created on:\t" + triple.object.value);
                                version = triple.object.value;
                                //console.log("dubbelcheck on the date:\t" + created.toString());
                                break;
                            }
                            case "http://schema.org/name": {
                                //console.log("naam van het station:\t" + triple.object.value);
                                name = triple.object.value;
                                break;
                            }
                            case "http://purl.org/dc/terms/created": {
                            //console.log("created on:\t" + triple.object.value);
                            created = triple.object.value;
                            //console.log("dubbelcheck on the date:\t" + created.toString());
                            break;
                        }
                        }
                    }
                });
                if (version && name && literal && created) {
                    let currentObservation = new Observation(created,literal);
                    if(currentObservation.isUsable()){
                        this.keeperOfTheObservations.addSimpleValue(literalPredicate, name, currentObservation);
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


    public getPage(id: any): Page {
        throw new Error('Method not implemented.');
    }
}