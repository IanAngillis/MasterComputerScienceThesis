// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from './../../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import managers from "./json/managers.json";
import {PackageManager} from "./models/package-manager";
import {BashManagerCommand, BashManagerArgs} from './models/tool-types'
import {allRules as RULES} from './rules';

function splitWithoutEmptyString(text: string, delimiter: string): string[] {
    return text.replace(/\r?\n/g, delimiter).replace(/\\/g, delimiter).split(delimiter).filter(w => w != "");
}

async function loop(path) {
    const dir = await fs.promises.opendir(path)
    for await (const dirent of dir) {
      console.log(dirent.name)
    }
}

function createLogName(){
    let date: Date = new Date();

    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let seconds = date.getSeconds();

    return year.toString() + month.toString() + day.toString() + hour.toString() + minute.toString() + seconds.toString() + "logs.txt";
}

  // TODO 
  //    - abstract into a module? 
  //    - Manually select and verify some files (ground truth dataset is nice, I guess)
  //    - Do not think yet of restoring file, focus first on enriching and detecting
  //        - Ideas for detecting, using the layers!
  //    - Do file analysis
async function main(){
    let stream : fs.WriteStream = fs.createWriteStream(createLogName(), {flags: 'a'});
    let packageManagers: PackageManager[] = [];
    // can be in a config object
    let delimiter: string = " ";

    // Folder which holds the data - should expand to folders eventually
    let folder = "./../data/dockerfiles/";

    // Create package managers as PackageManager objects
    managers.forEach(pm => {
        packageManagers.push(pm as PackageManager)
    })

    //For loops in for loops - we can improve this on some options, can't we?
    const dir = await fs.promises.opendir(folder)
    for await (const dirent of dir) {
        let ast = await ding.dockerfileParser.parseDocker(folder + dirent.name);
        let nodes = ast.find({type:ding.nodeType.BashCommand});
        //console.log(nodes.length + " BashCommands found");

        let bashManagerCommands: BashManagerCommand[] = [];

        nodes.forEach((node) => {
            packageManagers.forEach((manager) => {
                let foundNode = node.find({type: ding.nodeType.BashLiteral, value: manager.command});
                if(foundNode.length > 0){
                    let bashManagerCommand = new BashManagerCommand();
                    bashManagerCommand.layer = node.layer;
                    bashManagerCommand.absolutePath = node.absolutePath;
                    bashManagerCommand.setPosition(node.position);
                    bashManagerCommand.source = node;

                    let commands: string[] = splitWithoutEmptyString(node.toString(), delimiter);
                    
                    bashManagerCommand.versionSplitter = manager.packageVersionFormatSplitter;
                    bashManagerCommand.command = manager.command;
                    bashManagerCommand.option = commands.filter(w => !w.startsWith("-") && w != bashManagerCommand.command)[0];
                    bashManagerCommand.hasInstallOption = (bashManagerCommand.option == manager.installOption[0]);
                    bashManagerCommand.flags = commands.filter(w => w.startsWith("-"));
                    bashManagerCommand.arguments= [];
                    
                    // Initialize arguments
                    commands.filter(w =>    w != bashManagerCommand.command && 
                                            w != bashManagerCommand.option && 
                                            !w.startsWith("-"))
                                            .forEach(w => {
                                                //let bashManagerArg = new BashManagerArgs();
                                                //bashManagerArg.argument = w;
                                                bashManagerCommand.arguments.push(w);
                                            });
                    
                    bashManagerCommands.push(bashManagerCommand)
                }
            });
        });


        let text = dirent.name + " has got " + bashManagerCommands.length + " package commands";
        stream.write(text + "\n");
        //console.log(text);

        RULES.forEach(rule => {
            //For now assume package manager smells
            let manager = packageManagers.find(pm => pm.command == rule.detection.manager);
            switch(rule.detection.type){
                case "VERSION-PINNING":
                    if(manager == null){
                        //console.log("No such manager found");
                    }else{
                        bashManagerCommands.filter(c => c.command == rule.detection.manager && c.option == manager.installOption[0]).forEach(c => {
                            let requiresVersionPinning: boolean = false;
                            c.arguments.forEach(arg => {
                                if(arg.search(manager.packageVersionFormatSplitter) == -1){
                                    stream.write("VIOLATION DETECTED: -- CODE " + rule.code + ": " + arg + " -- no version specified in file\n");
                                    requiresVersionPinning = true;
                                }
                            });

                        });
                    }
                    break;
                
                case "NO-INTERACTION":
                    break;
                
                case "CLEAN-CACHE":
                    if(manager == null){

                    }else{
                        /** Whats the plan here?
                         * Check if it is a flag in install - TODO tomorrow
                         * 
                         * 
                         */
                    }
                    break;

                case "NO-RECOMMENDS":
                    break;
                
                default:
                    //console.log("no such option");
                    break;
            }     
        });

        
        // fs.writeFileSync(dirent.name + ".txt", text);

    }

    stream.close();

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