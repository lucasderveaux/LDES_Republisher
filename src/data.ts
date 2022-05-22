import { IConfig } from "./config";
import { ObservationKeeper } from "./Objects/ObservationKeeper"
import { DataWriter } from "./DataWriter";
import { GeneralExtractor } from "./sources/GeneralExtractor";
import { PAAConverter } from "./PAAConverter";

export class Data {
    private readonly config: IConfig;
    private keeperOfTheObservations: ObservationKeeper;

    public constructor(config: IConfig) {
        this.config = config;
        this.keeperOfTheObservations = new ObservationKeeper();
    }

    public async fetchData(): Promise<void> {
        let source = new GeneralExtractor(this.keeperOfTheObservations, this.config);
        return new Promise<void>(async (resolve, reject) => {
            try {
                await source.getData();
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    public async writeData(): Promise<void> {
        let dataWriter = new DataWriter();
        return new Promise<void>(async (resolve, reject) => {
            try {
                await dataWriter.writeData(this.keeperOfTheObservations, this.config);
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        })
    }

    public async convertData(): Promise<void> {
        let PAA = new PAAConverter(this.config);
        return new Promise<void>(async (resolve, reject) => {
            try {
                await PAA.ConvertAll(this.keeperOfTheObservations);
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

}