import type * as RDF from 'rdf-js';
import {ISource} from './ISource';
import {Page} from "../lib/Page"

export class BlueBikeExample implements ISource{
    private triples: RDF.Quad[];
    private metadata:RDF.Quad[];   

    constructor(){
        //Hier zou nog vanalles kunnen komen in het verband met triples en metadat.
        //Misschien moet ik terug met Pages werken want eigenlijk was dat wel een goed systeem.
        //Ja ik ga dat doen dat is super logisch.
    }

    getPage():Page{
        return null;
    }


}