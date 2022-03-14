import { BlueBikeExample } from "./sources/BlueBikeExample";
import { ISource } from "./sources/ISource";
import {IData} from "./sources/IData";

export class Router{
    private bbe: ISource;
    constructor(){
        console.log("it worked");
        this.bbe = new BlueBikeExample();
    }

    public test():any{
        this.bbe.getData().then((data:IData[])=>{
            data.forEach((x)=>{
                console.log(x);
            });
        });
        return "it's happening";
    }

    public error():any{
        return "Mistakes were made";
    }
}