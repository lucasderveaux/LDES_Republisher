import {Page} from "../Objects/Page";
import { Observation } from "../Objects/Observation";

export interface ISource{
    /*
    Wat ik eigenlijk wil hier is een super duidelijk overzicht van de specific 
    LDES die ik nodig heb
    namelijk 3 aspecten

    - locatie
    - raw data (double int whatever)
    - Timestamp
    */
    getData():void;
    getPage(id:any):Page;
}