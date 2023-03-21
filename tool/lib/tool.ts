// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from './../../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import managers from "./json/managers.json";
import {PackageManager} from "./models/package-manager";

async function main(){

    let packageManagers: PackageManager[] = [];

    managers.forEach(pm => {
        packageManagers.push(pm as PackageManager)
    })

    const ast = await ding.dockerfileParser.parseDocker("data/aptget.Dockerfile");
    let node = ast.find({type:ding.nodeType.BashCommand});

    console.log(node[1].isBefore(node[0]));

    // packageManagers.forEach(x => {
    //     let cmd = x.command;
    //     console.log("looking for command: " + cmd);
    //     let nodes = ast.find({type:BashCommand, value: cmd});
    //     console.log(nodes);
    //     if(nodes.length != 0){
    //         console.log("command " + x.command + " found");
    //     }else{
    //         console.log("command " + x.command + " not found");
    //     }
    // });
    //const folder = './../../data/dockerfiles/';


    //const ast = await ding.dockerfileParser.parseDocker("data/aptget.Dockerfile");
    //console.log(ast);
    //console.log(ast.find({type: BashCommand, value: "apt-get"}));    
}

main()