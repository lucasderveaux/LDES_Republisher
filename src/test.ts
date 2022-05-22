import { Data } from "./data";
import { IConfig, getConfig } from "./config";
import { SortedMap } from "collections/sorted-map";
import { PAAConverter } from "./PAAConverter";

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

    //let paa = new PAAConverter(null);

//     let timestamps = new Map<number, number>();
//     timestamps.set(Date.parse("2019-01-16 00:00:10"), 7);
//     timestamps.set(Date.parse("2019-01-16 00:01:52"), 13);
//     timestamps.set(Date.parse("2019-01-16 00:02:54"), 1);
//     timestamps.set(Date.parse("2019-01-16 00:03:08"), 8);
//     timestamps.set(Date.parse("2019-01-16 00:04:00"), 20);
//     timestamps.set(Date.parse("2019-01-16 00:05:49"), 8);
//     timestamps.set(Date.parse("2019-01-16 00:07:02"), 13);
//     timestamps.set(Date.parse("2019-01-16 00:07:42"), 10);
//     timestamps.set(Date.parse("2019-01-16 00:08:20"), 16);
//     timestamps.set(Date.parse("2019-01-16 00:10:01"), 15);
//     timestamps.set(Date.parse("2019-01-16 00:10:52"), 8);
//     timestamps.set(Date.parse("2019-01-16 00:11:39"), 4);

    
//     let i = 0;
//     for (let x of timestamps.keys()) {
//         if ((x - i) > 17500) {
//             console.log(x - i);
//         }
//         i = x;
//     }


//     console.log("\nnu paa\n");
//     let test = await paa.convertOne(timestamps);

//     i = 0;
//     for (let x of test.keys()) {
//         if ((x - i) > 17500) {
//             console.log(x - i);
//         }
//         i = x;
//         let date = new Date(x);    

//         console.log(date.toLocaleTimeString()+" "+test.get(x));
//     }
    
//    let iterator = test.keys();
//    let key1 = iterator.next().value;
//    let key2= iterator.next().value;
//    console.log(key2-key1);

let string = "Thu Apr 28 2022"+" 00:00:00"
let date = Date.parse(string);
let date2 = date + 24*60*60*1000;
let datE = new Date(date);
let datE2 = new Date(date2);
console.log(datE.toLocaleString());
console.log(datE2.toLocaleString());


}
run().catch((error) => {
    console.log(error.message)
});


