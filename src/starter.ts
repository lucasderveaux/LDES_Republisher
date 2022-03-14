import * as express from 'express';
import * as cors from 'cors';
import { Router } from './router';

const app = express();
app.use(cors());

export class StarterClass{
    constructor(){
        let rt:Router = new Router();

        app.get('/:test',(req,res,next)=>{
            let requestParameter: string = req.params.test;
            if(requestParameter=="test"){
                res.send(rt.test());
            }else{
                res.send(rt.error());
            }
        });

    }

    public start():any {
        return app.listen(8080);
    }

}