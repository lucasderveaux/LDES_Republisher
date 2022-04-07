import { Page } from '../Objects/Page';
import { ASource } from './ASource';
import { IConfig } from '../config';
import { ObservationKeeper } from '../Objects/ObservationKeeper';


export class GeneralExtractor extends ASource {
    private config:IConfig;
    constructor(keeperOfTheObservations:ObservationKeeper,config:IConfig){
        super(keeperOfTheObservations);
        this.config = config;
    }

    public getData(): void {
        console.log(this.config.literal_values);
        console.log(typeof this.config.literal_values)
    }
    public getPage(id: any): Page {
        throw new Error('Method not implemented.');
    }
}