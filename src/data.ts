import { IConfig } from "./config";
import { ObservationKeeper } from "./lib/ObservationKeeper"
import { BlueBikeExample } from "./sources/BlueBikeExample";
import { ISource } from "./sources/ISource";
import { existsSync, mkdirSync } from 'fs';

export class Data{
    private readonly config:IConfig;
    private keeperOfTheObservations:ObservationKeeper;
    private source:ISource;


    public constructor(config:IConfig){
        this.config = config;
        this.keeperOfTheObservations = new ObservationKeeper();
        this.source = new BlueBikeExample(this.keeperOfTheObservations);
        
        // create necessary directories where data will be stored
		if (!existsSync(this.config.storage)) {
			mkdirSync(this.config.storage);
		}

    }

    public async fetchData():Promise<void> {
        return new Promise<void>(async(resolve,reject)=>{
            try{
                await this.source.getData();
                return resolve();
            } catch(e){
                console.error(e);
                return reject(e);
            }
        });
    }

    public async writeData():Promise<void>{
        //hier ga ik wegschrijven
    }

}