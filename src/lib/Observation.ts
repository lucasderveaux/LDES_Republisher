export class Observation{
    private timestamp:Date;
    private value:number;

    constructor(timestamp:Date,value:number){
        this.timestamp=timestamp;
        this.value=value;
    }

    public getTimestamp():Date{
        return this.timestamp;
    }

    public getValue():number{
        return this.value;
    }
}