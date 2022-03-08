import {Page} from "../lib/Page";

export interface ISource{
    getPage(id:any):Page;
}