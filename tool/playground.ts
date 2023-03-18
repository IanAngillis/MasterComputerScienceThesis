// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from '../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import { BashCommand, BashCommandCommand, BashLiteral, DockerCmd, DockerCmdArg, DockerOpsValueNode } from '../Dinghy-main/Dinghy-main/build/docker-type.js';


async function main(){
    const shellString: string= "echo 'deb http://httpredir.debian.org/debian stretch-backports main' > /etc/apt/sources.list.d/stretch-backports.list \
    \
     && apt-get -q update \
     && apt-get -y -q --no-install-recommends install \
        # install the jdk and its dependencies\
        ca-certificates-java \
        openjdk-${openjdk.version.major}-jdk-headless=${openjdk.version}'*' \
        # procps is used in the jvm shutdown hook\
        procps \
        # other system utilities\
        netbase \
        unzip \
        wget \
    \
     # cleanup package manager caches\
     && apt-get clean \
     && rm /var/lib/apt/lists/*_*"
    // Be aware of the path on either Windows or Unix systems
    let counter = 0;

    const folder = './../data/dockerfiles/';

    fs.readdir(folder,  (err, files) => {
        files.forEach( file => {
            
            ding.dockerfileParser.parseDocker(folder + file);
        })
    });

    //const shellAst = await ding.shellParser.parseShell(shellString);
    //console.log(shellAst.children);
    


    // const ast = await ding.dockerfileParser.parseDocker(folder + "2372f3ba92618b36fcec40d47995dd16c282d9df.Dockerfile");
    // console.log(ast);
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