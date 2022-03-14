import type * as RDF from 'rdf-js';
import {ISource} from './ISource';
import {Page} from "./Page";
import { newEngine } from '@treecg/actor-init-ldes-client';
import { Observation } from '../lib/Observation';

export class BlueBikeExample implements ISource{
    //private triples: RDF.Quad[];
    //private metadata:RDF.Quad[];   

    constructor(){
        //Hier zou nog vanalles kunnen komen in het verband met triples en metadat.
        //Misschien moet ik terug met Pages werken want eigenlijk was dat wel een goed systeem.
        //Ja ik ga dat doen dat is super logisch.
    }

    

    getPage():Page{
        return null;
    }

   
    async getData():Promise<Observation> {
        return null;
        /*
        return new Promise<IData[]>((resolve,reject)=>{
            try {
                let options = {
                    emitMemberOnce: true,
                    disablePolling: true,
                    mimeType: 'application/ld+json',
                    representation: "Quads",
                };

                let LDESClient = newEngine();
                let eventStreamSync = LDESClient.createReadStream(
                    "https://www.pieter.pm/Blue-Bike-to-Linked-GBFS/bluebike.ttl",
                    options
                );

                let data: IData[] = [];

                eventStreamSync.on('data', (member : any) => {
                    //data.push(member);
                    //het is hier ook met Quads wnat ik heb die representation zo ingesteld
                    let memberURI = member.id.value;
                    //console.log(memberURI);
                    let quads=member.quads;
                    //console.log(quads);
                    data.push(member);
                });
                eventStreamSync.on('end', () => {
                    console.log("No more data!");
                    resolve(data);
                });
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
        */
    }

}