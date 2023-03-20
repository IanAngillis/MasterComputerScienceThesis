// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from './../../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import { BashCommand, BashCommandCommand, BashConditionBinary, BashLiteral, BashScript, DockerCmd, DockerCmdArg, DockerOpsValueNode, DockerRun } from './../../Dinghy-main/Dinghy-main/build/docker-type.js';
import managers from "./json/managers.json";

async function main(){

    console.log(managers);
    const folder = './../../data/dockerfiles/';


    const ast = await ding.dockerfileParser.parseDocker("data/aptget.Dockerfile");
    console.log(ast);
    //console.log(ast.find({type: BashCommand, value: "apt-get"}));    
}

main()