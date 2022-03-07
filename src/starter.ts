import * as express from 'express';
import * as cors from 'cors';
const app = express();
app.use(cors());

export class StarterClass{
    constructor(){

        app.get('/test',(req,res,next)=>{
            console.log('Request type:',req.method);
            res.type('text/plain');
            res.send("Gij lelijk wijf");
        });

    }

    public start():any {
        return app.listen(3000);
    }

    
}