import { Observation } from "./Observation";

export class ObservationKeeper{
    private simpleValues:Map<string,Map<string,Array<Observation>>>;
    constructor(){
        this.simpleValues = new Map<string,Map<string,Array<Observation>>>();
    }

    private createNewSimpleValue(idSimpleValue:string):void{
        this.simpleValues[idSimpleValue] = new Map<string,Array<Observation>>();
    }

    private createNewLocationId(idSimpleValue:string,idLocation:string):void{
        this.simpleValues[idSimpleValue][idLocation]=new Array<Observation>();
    }

    public addSimpleValue(idSimpleValue:string,idLocation:string,simpleValue:Observation){
        if(!this.simpleValues.has(idSimpleValue)){
            this.createNewSimpleValue(idSimpleValue);
        }

        if(!this.addSimpleValue[idSimpleValue].has(idLocation)){
            this.createNewLocationId(idSimpleValue,idLocation);
        }

        this.simpleValues[idSimpleValue][idLocation].push(simpleValue);
    }
    
}