import {Page} from "../lib/Page";
import { Observation } from "../lib/Observation";

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