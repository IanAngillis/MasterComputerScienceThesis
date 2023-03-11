// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from '../Dinghy-main/Dinghy-main/build/index.js';


async function main(){
    const ast = await ding.dockerfileParser.parseDocker("C:\\Users\\Ian Angillis\\Workspace\\MasterComputerScienceThesis\\tool\\Dockerfile");

    console.log(ast);
}

main()