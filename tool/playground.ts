// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from '../Dinghy-main/Dinghy-main/build/index.js';


async function main(){
    // Be aware of the path on either Windows or Unix systems
    const ast = await ding.dockerfileParser.parseDocker("./Dockerfile");

    console.log(ast);
}

main()