import { IConfig } from "./config";
import { ObservationKeeper } from "./Objects/ObservationKeeper"
import { DataWriter } from "./DataWriter";
import { GeneralExtractor } from "./sources/GeneralExtractor";
import { PAAConverter } from "./PAAConverter";

export class Data {
    private readonly config: IConfig;
    private keeperOfTheObservations: ObservationKeeper;
    private source: GeneralExtractor;
    private dataWriter: DataWriter;
    private PAA: PAAConverter;


    public constructor(config: IConfig) {
        this.config = config;
        this.keeperOfTheObservations = new ObservationKeeper();
        this.source = new GeneralExtractor(this.keeperOfTheObservations, this.config);
        this.dataWriter = new DataWriter();
        this.PAA = new PAAConverter();
    }

    public async fetchData(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await this.source.getData();
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    public async writeData(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await this.dataWriter.writeData(this.keeperOfTheObservations, this.config);
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        })
    }

    public async convertData(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await this.PAA.ConvertAll(this.keeperOfTheObservations);
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

}