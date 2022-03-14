import type * as RDF from "rdf-js";
import * as RdfString from "rdf-string";

export class Page{
    private triples: RDF.Quad[];
    private metadata: RDF.Quad[];

    constructor(triples:RDF.Quad[],metadata:RDF.Quad[]){
        this.triples = triples;
        this.metadata = metadata;
    }

    getMetada():RDF.Quad[]{
        return this.metadata;
    }

    getTriples():RDF.Quad[]{
        return this.triples;
    }

    //moet dit eigenlijk wel?
    //ik weet niet of dit goed is

    public serialize():object{
        let serialized: object = {};
        let triples = [];
        let metadata = [];

        this.triples.forEach(triple => {triples.push(RdfString.quadToStringQuad(triple))})
        serialized['triples'] = triples;
        this.metadata.forEach(metadata_quad => {metadata.push(RdfString.quadToStringQuad(metadata_quad))})
        serialized['metadata'] = metadata;
        return serialized;
    }
}