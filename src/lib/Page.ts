import type * as RDF from "rdf-js";
import * as RdfString from "rdf-string";
import * as f from "@dexagod/rdf-retrieval"
import rdfSerializer from "rdf-serialize";

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

    public async getSerializedPage(contentType:string ="text/turtle"):Promise<NodeJS.ReadableStream>{
        let all: RDF.Quad[]=this.getMetada();
        all = all.concat(this.getTriples());
        const tripleStream:RDF.Stream<RDF.Quad>=await f.quadArrayToQuadStream(all);

        return rdfSerializer.serialize(tripleStream,{contentType:contentType});
    }
}