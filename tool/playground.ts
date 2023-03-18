// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from '../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import { BashCommand, BashCommandCommand, BashLiteral, DockerCmd, DockerCmdArg, DockerOpsValueNode } from '../Dinghy-main/Dinghy-main/build/docker-type.js';


async function main(){
    // Be aware of the path on either Windows or Unix systems
    let counter = 0;

    const folder = './../data/binnacle/github/deduplicated-sources/';

    fs.readdir(folder,  (err, files) => {
        files.forEach( file => {
            
            ding.dockerfileParser.parseDocker(file).then(r => {
                console.log("checking file: ");
                console.log(r);
                console.log("This was file: " + counter);
                counter += 1;
            });
        })
    })


    //const ast = await ding.dockerfileParser.parseDocker("./Dockerfile");
    //let printer = new ding.PrettyPrinter(ast);

    //    console.log((ast.find("DockerCmd")[0].children[1] as DockerOpsValueNode).value);

    //console.log(ast.find({type: DockerCmd}));
    //Could be resolved with union types - this way, I do not necessarily need to haggle with library code

    // ast.traverse((node) => {
    //     if(node.type = 'DOCKER-PATH'){
    //         console.log(node);
    //     }
    // })

    //console.log(ast.find({type: "DOCKER-FROM"}).toString());
    //console.log(ast);
    //let text = printer.print();
    //fs.writeFileSync("NewDockerfile", text);
}

main()