
import { IConfig } from '../config';
import { ObservationKeeper } from '../Objects/ObservationKeeper';
import { newEngine } from '@treecg/actor-init-ldes-client';
import type * as RDF from 'rdf-js';



export class GeneralExtractor {
    //configuration
    private config: IConfig;
    // list of the literal_values that can be found in the given LDES
    private literal_values: string[];
    
    private keeperOfTheObservations:ObservationKeeper;

    //test
    // private url: string;
    // private url_timestamp: string;
    // private url_feature_of_interest: string;
    //test

    constructor(keeperOfTheObservations: ObservationKeeper, config: IConfig) {
        this.keeperOfTheObservations=keeperOfTheObservations;
        this.config = config;
        this.literal_values = this.config.literal_values;

        //test
        //this.literal_values = ["http://www.w3.org/ns/sosa/hasSimpleResult"];
        //this.url = "https://production.crowdscan.be/feed/public/gent_langemunt/v1/1";
        //    this.url_timestamp="http://www.w3.org/ns/sosa/resultTime";
        //    this.url_feature_of_interest="http://www.w3.org/ns/sosa/hasFeatureOfInterest";
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

                    //this.controle();

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
                // feature_of_interest
                let feature: string;
                // potential name of the feature_of_interest or the observation
                // if a name is given, it is only used as the name of the file and a key for the observationKeeper
                let name: string;
                let created: string;
                let observations = new Map<string, number>();

                
                member.forEach((triple) => {
                    if (this.literal_values.includes(triple.predicate.value)) {
                        observations.set(triple.predicate.value, parseFloat(triple.object.value));
                    } else {
                        switch (triple.predicate.value) {
                            case this.config.uri_feature_of_interest: {
                                feature = triple.object.value;
                                break;
                            }
                            case "http://schema.org/name": {
                                name = triple.object.value;
                                break;
                            }
                            case this.config.uri_timestamp: {
                                created = triple.object.value;
                                break;
                            }
                        }
                    }
                });
                if (feature && created) {
                    if (!name) {
                        // if there is no other name given, the feature of interest is used as key
                        name = feature;
                    }


                    for (let key of observations.keys()) {
                        if (observations.get(key)) {
                            this.keeperOfTheObservations.addSimpleValue(key, name, created, observations.get(key));
                        }
                    }
                    this.keeperOfTheObservations.addFeatureOfInterest(name, feature);
                }

                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }

        });

    }

    // The function used to test the observationKeeper class
    public controle(): void {
        for (let w of this.keeperOfTheObservations.simpleValues.keys()) {
            // the type of the observations
            console.log(w);
            for (let x of this.keeperOfTheObservations.simpleValues.get(w).keys()) {
                //The string of the day
                console.log("\t-\t" + x);
                for (let y of this.keeperOfTheObservations.simpleValues.get(w).get(x).keys()) {
                    // The feature of interest
                    console.log("\t\t\t" + y);

                    for (let z of this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y).keys()) {
                        //the sortedMap of the observations
                        console.log("\t\t\t\t" + z + ":\t" + this.keeperOfTheObservations.simpleValues.get(w).get(x).get(y).get(z));
                    }
                }
            }
        }
    }


  
}