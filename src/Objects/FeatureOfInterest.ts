export class FeatureOfInterest {
    private longitude: number;
    private latitude: number;
    private id: string;

    constructor(longitude: number, latitude: number, id: string) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.id = id;
    }

    public getLongitude(): number {
        return this.longitude;
    }

    public getLatitude(): number {
        return this.latitude;
    }

    public getId(): string {
        return this.id;
    }
}