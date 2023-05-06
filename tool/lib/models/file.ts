import * as ding from './../../../Dinghy-main/Dinghy-main/build/index.js';

export class File{
    absolutePath: string;
    file: string; 
    extractedLayer?:number; 
    extractedStatement?:ding.nodeType.BashCommand;
    introducedLayer?:number;
    introducedStatement?:ding.nodeType.DockerOpsNodeType;
    deletedLayer?:number;
    deletedStatement?:ding.nodeType.BashCommand;
    urlOrigin?:boolean;
    isDirectory?:boolean; 
    isCompressed:boolean;
    containerPath:string;
    introducedBy: "COPY"|"ADD"|"BUILT-IN";
}