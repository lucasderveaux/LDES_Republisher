import { Data } from "./data";
import { IConfig, getConfig } from "./config";
import { SortedMap } from "collections/sorted-map";

const run = async (): Promise<void> => {
    console.log("at least it's starting...");

    // let data_fetcher = new Data(getConfig());
    // await data_fetcher.fetchData();
    // await data_fetcher.convertData();


    // await data_fetcher.writeData();

    // let sortedMap = new SortedMap();

    // sortedMap.set(1,"Bas");
    // sortedMap.set(4,"Maarten");
    // sortedMap.set(3,"lucas");

    // for(let str of sortedMap.keys()){
    //     console.log(sortedMap.get(str));
    // }
    // console.log("\n");

    // sortedMap.set(2,"Lore");
    // sortedMap.set(3,"Lucas");

    // for(let str of sortedMap.keys()){
    //     console.log(sortedMap.get(str));
    // }

    // sortedMap.set(2,"Jeroen");
    // console.log("\nnieuw\n\n");

    // for(let str of sortedMap.keys()){
    //     console.log(sortedMap.get(str));
    // }

    // console.log(sortedMap.keys().next().value);

    let test = "https://production.crowdscan.be/feed/public/gent_langemunt/v1/1";
    
    let nieuw = test.match(/\.[a-zA-z]+\/(.*)/);
    

    console.log(nieuw[1]);

    
}
run().catch((error) => {
    console.log(error.message)
});


