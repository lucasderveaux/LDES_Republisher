import { Observation } from '../Objects/Observation';
import {ISource} from './ISource';
import { Page } from '../Objects/Page';
import {ObservationKeeper} from '../Objects/ObservationKeeper';

export abstract class ASource implements ISource{
    keeperOfTheObservations:ObservationKeeper;
    constructor(keeperOfTheObservations:ObservationKeeper){
        this.keeperOfTheObservations = keeperOfTheObservations;
    }

    public abstract getData():void;
    public abstract getPage(id:any):Page;

    /*
    hier wil ik vanalles doen
    Ik ga de methodes er hier al allemaal inzetten
    */

    public SchrijfWeg():void{
        //maakt een LDES per locatie en schrijft die weg
        //that is how the cookie crumbles
        //nog niet per 24u laten we deze gewoon schrijven per 100 ofzo....
    }

    public ControleerGrootte():void{
        //checkt te grootte en roept de SchrijfWegMethode op
    }

    public createPage():Page{
        //Gaat een pagina creëren die de klasse kan wegschrijven
        return null;
    }
    
    public PublishData():void{
        //die schrijft dat weg naar GithubPages.
        //Echter ik weet dat dit niet is hoe dit werkt
    }
}