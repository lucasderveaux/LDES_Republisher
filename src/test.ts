import {Data} from "./data";
import {IConfig,getConfig} from "./config";


const run = async (): Promise<void> => {
    console.log("at least it's starting...");
    //const data_fetcher = new Data(getConfig());
    //await data_fetcher.fetchData();
    //await data_fetcher.writeData(null);

    let test = '["koe", "melk", "poeder"]';

    

    let test2:string[];
    test2 = JSON.parse(test);
    if(test2.includes('melk')){
        console.log("ja");
    }else{
        console.log("nee");
    }

}
run().catch((error) => {
    console.log(error.message)
});


