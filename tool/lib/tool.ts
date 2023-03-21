// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from './../../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import { BashCommand, BashCommandCommand, BashConditionBinary, BashLiteral, BashScript, DockerCmd, DockerCmdArg, DockerOpsValueNode, DockerRun } from './../../Dinghy-main/Dinghy-main/build/docker-type.js';
import managers from "./json/managers.json";
import {PackageManager} from "./models/package-manager";

async function main(){

    let packageManagers: PackageManager[] = [];

    managers.forEach(pm => {
        packageManagers.push(pm as PackageManager)
    })

    const ast = await ding.dockerfileParser.parseDocker("data/aptget.Dockerfile");

    packageManagers.forEach(x => {
        console.log("looking for command: " + x.command);
        let nodes = ast.find({type:BashCommand, value: x.command});
        if(nodes.length != 0){
            console.log("command " + x.command + " found");
        }else{
            console.log("command " + x.command + " not found");
        }
        console.log()
    });
    //const folder = './../../data/dockerfiles/';


    //const ast = await ding.dockerfileParser.parseDocker("data/aptget.Dockerfile");
    //console.log(ast);
    //console.log(ast.find({type: BashCommand, value: "apt-get"}));    
}

main()