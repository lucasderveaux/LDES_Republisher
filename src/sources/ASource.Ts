import { Observation } from '../lib/Observation';
import {ISource} from './ISource';
import { Page } from './Page';
import {ObservationKeeper} from '../lib/ObservationKeeper';

export abstract class ASource implements ISource{
    private keeperOfTheObservations:ObservationKeeper;
    constructor(){
        this.keeperOfTheObservations = new ObservationKeeper();
    }

    public abstract getData():Promise<Observation[]>;
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