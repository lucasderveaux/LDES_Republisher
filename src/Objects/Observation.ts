export class Observation {
    private timestamp: string;
    private value: number;

    constructor(timestamp: string, value: number) {
        this.timestamp = timestamp;
        this.value = value;
    }

    public getTimestamp(): string {
        return this.timestamp;
    }

    public getValue(): number {
        return this.value;
    }

    public toString(): string {
        return this.getTimestamp() + "\t" + this.getValue();
    }

    public isUsable(): boolean {
        if (this.timestamp == undefined) {
            return false;
        }
        if (this.value == null || this.value == undefined) {
            return false;
        }
        return true;
    }
}