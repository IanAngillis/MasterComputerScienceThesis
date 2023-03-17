// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from '../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import { BashCommand, BashCommandCommand, BashLiteral, DockerOpsValueNode } from '../Dinghy-main/Dinghy-main/build/docker-type.js';


async function main(){
    // Be aware of the path on either Windows or Unix systems
    const ast = await ding.dockerfileParser.parseDocker("./Dockerfile");
    let printer = new ding.PrettyPrinter(ast);

    // ast.traverse((node) => {
    //     if(node.type = 'DOCKER-PATH'){
    //         console.log(node);
    //     }
    // })

    console.log(ast.find({type: "DOCKER-FROM"}).toString());

    //let text = printer.print();
    //fs.writeFileSync("NewDockerfile", text);
}

main()