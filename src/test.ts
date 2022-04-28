import {Data} from "./data";
import {IConfig,getConfig} from "./config";
import {SortedMap} from "collections/sorted-map";

const run = async (): Promise<void> => {
    console.log("at least it's starting...");

    // let data_fetcher = new Data(getConfig());
    // await data_fetcher.fetchData();
    // await data_fetcher.convertData();


    //await data_fetcher.writeData(null);

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

    let test = "http://www.w3.org/ns/sosa/hasSimpleResult";
    test = test.substring(test.lastIndexOf('/')+1);

    console.log(test);

}
run().catch((error) => {
    console.log(error.message)
});


