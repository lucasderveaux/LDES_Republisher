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

    // creates the GeneralExtractor class that fetches the data
    // The Generalextractor will give the right information to the ObservationKeeper class
    // The observationKeeper class will store the observations correctly
    public async fetchData(): Promise<void> {
        let source = new GeneralExtractor(this.keeperOfTheObservations, this.config);
        return new Promise<void>(async (resolve, reject) => {
            try {
                console.log("Fetching Data");
                await source.getData();
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    // This function will create the PAAConverter
    // The PAAConverter will convert all the time sereis in the observationKeeper to regular time series
    public async convertData(): Promise<void> {
        let PAA = new PAAConverter(this.config);
        return new Promise<void>(async (resolve, reject) => {
            try {
                console.log("Starting PAA");
                await PAA.ConvertAll(this.keeperOfTheObservations);
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    }

    // This function will create the DataWriter class
    // creates all the files that contain the Linked Data Event Streams
    public async writeData(): Promise<void> {
        let dataWriter = new DataWriter();
        return new Promise<void>(async (resolve, reject) => {
            try {
                console.log("Writing data");
                await dataWriter.writeData(this.keeperOfTheObservations, this.config);
                return resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        })
    }

}