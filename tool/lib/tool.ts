// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from './../../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import managers from "./json/managers.json";
import {PackageManager} from "./models/package-manager";
import {BashManagerCommand, BashManagerArgs} from './models/tool-types'
import {allRules as RULES} from './rules';
import { Rule } from './models/rule.js';

//Defining constants

const delimiter: string = " ";

function splitWithoutEmptyString(text: string, delimiter: string): string[] {
    return text.replace(/\r?\n/g, delimiter).replace(/\\/g, delimiter).split(delimiter).filter(w => w != "");
}

// TODO remove later?
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

/**
 * Procedure that convers a node, given a specific manager, into a BashManagerCommand that contains all the information required.
 * @param node 
 * @param manager 
 * @returns 
 */
function bashManagerCommandBuilder(node: ding.nodeType.DockerOpsNodeType, manager: PackageManager): BashManagerCommand {
    let bashManagerCommand = new BashManagerCommand();
    bashManagerCommand.layer = node.layer;
    bashManagerCommand.absolutePath = node.absolutePath;
    bashManagerCommand.setPosition(node.position);
    bashManagerCommand.source = node;

    let commands: string[] = splitWithoutEmptyString(node.toString(true), delimiter);

    
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
    return bashManagerCommand;
}

function checkIfFlagIsPresent(bashManagerCommands: BashManagerCommand[], 
    rule: Rule,
    manager: PackageManager,
    flag: { value: string, type?:""}

    ): boolean{

}

  // TODO 
  //    - abstract into a module? 
  //    - Manually select and verify some files (ground truth dataset is nice, I guess)
  //    - Do not think yet of restoring file, focus first on enriching and detecting
  //        - Ideas for detecting, using the layers!
  //    - Do file analysis
  //    - Create detailed report for smells!
  //    - Keep track of amount of smells, amount of amount of smells etc in a proper log class?
  //    - Definitely need to split this up in more functions The package analyzer can be a class of its own - not sure yet what to do about repairing
async function main(){
    let log : fs.WriteStream = fs.createWriteStream("./logs/" + createLogName(), {flags: 'a'});
    let packageManagers: PackageManager[] = [];
    // can be in a config object
    //delete reports (for now, don't do this in end product)
    fs.readdir("./reports", (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink("./reports/" + file, (err) => {
            if (err) throw err;
          });
        }
      });
      


  

    //console.log(splitWithoutEmptyString("rm -rf /var/list/*", " "));

    // Folder which holds the data - should expand to folders eventually
    let folder = "./../data/dockerfiles/";

    // Create package managers as PackageManager objects
    managers.forEach(pm => {
        packageManagers.push(pm as PackageManager)
    })

    //For loops in for loops - we can improve this on some options, can't we?
    const dir = await fs.promises.opendir(folder)
    for await (const dirent of dir) {
        let fileReport: string = "Report for: " + dirent.name + "\n";
        let ast = await ding.dockerfileParser.parseDocker(folder + dirent.name);
        let nodes = ast.find({type:ding.nodeType.BashCommand});
        //console.log(nodes.length + " BashCommands found");

        // Create Bashamangercommands - intermediary representation
        let bashManagerCommands: BashManagerCommand[] = [];

        nodes.forEach((node) => {
            packageManagers.forEach((manager) => {
                let foundNode = node.find({type: ding.nodeType.BashLiteral, value: manager.command});
                if(foundNode.length > 0){
                    bashManagerCommands.push(bashManagerCommandBuilder(node, manager));
                }
            });
        });

        // Apply rules
        let text = dirent.name + " has got " + bashManagerCommands.length + " package commands";
        log.write(text + "\n");
        //console.log(text);

        RULES.forEach(rule => {
            fileReport += "Checking rule " + rule.code + " -- " + rule.message +":\n";
            //For now assume package manager smells
            //TODO Check if manager exists - if not, we can move away from the package manager smells and go to the other smells
            let manager: PackageManager = packageManagers.find(pm => pm.command == rule.detection.manager);
            switch(rule.detection.type){
                case "VERSION-PINNING":
                    if(manager == null){
                        console.log("No such manager found");
                    }else{
                        bashManagerCommands.filter(c => c.command == rule.detection.manager && c.option == manager.installOption[0]).forEach(c => {
                            let requiresVersionPinning: boolean = false;
                            // if(dirent.name == "1c1994e05f61bfab226254e9b510e97547e5d148.Dockerfile"){
                            //     console.log(c.arguments);
                            // }
                            c.arguments.forEach(arg => {
                                if(arg.search(manager.packageVersionFormatSplitter) == -1){
                                    //console.log("no pinned version found");
                                    log.write("VIOLATION DETECTED: -- CODE " + rule.code + ": " + arg + " -- no version specified in file\n");
                                    fileReport += "\tVOILATION DETECTED: " + arg + " at position:" + c.position.toString() + " for " + manager.command + " command\n";
                                    requiresVersionPinning = true;
                                }else {
                                    //console.log("pinned version found");
                                }
                            });

                        });
                    }
                    break;
                
                case "NO-INTERACTION":
                    if(manager!=null){
                        let noninteractionflag = manager.installOptionFlags.find(flag => flag.type == "NO-INTERACTION");
                        //console.log(noninteractionflag.value);
                        if(noninteractionflag != undefined){
                            bashManagerCommands.filter(c => c.command == rule.detection.manager && c.option == manager.installOption[0]).forEach( c => {

                                let nonInteractionFlagIsPresent = false;
                                c.flags.forEach(flag => {
                                    if(flag == noninteractionflag.value){
                                        //console.log("noninteractionflag found");
                                        nonInteractionFlagIsPresent = true;
                                    }
                                });

                                if(!nonInteractionFlagIsPresent){
                                    fileReport += "\tVOILATION DETECTED: " + noninteractionflag.value + " flag missing at position:" + c.position.toString() + " for " + manager.command + " command\n";
                                    //console.log("VIOLATION DETECTED: -- CODE " + rule.code + ": " + manager.command + " -- no interaction prevented in file " + dirent.name + "\n");
                                }
                            });
                        }
                    }
                    break;
                
                case "CLEAN-CACHE":
                    if(manager != null){
                        /** Whats the plan here?
                         * Check if it is a flag in install - TODO tomorrow
                         */

                        // If isinstallFlag - we check if flag is present, can be a higher order function really.
                        if(manager.cleanCacheIsInstallFlag){
                            let installFlag = manager.installOptionFlags.find(flag => flag.type == "CLEAN-CACHE");
                            if(installFlag != undefined){
                                let found = false;
                                bashManagerCommands.filter(c => c.command == rule.detection.manager && c.option == manager.installOption[0]).forEach(c => {
                                    
                                    if(c.flags.find(flag => flag == installFlag.value) != undefined){
                                        //console.log("clean cache flag found");
                                    }else{
                                        fileReport += "\tVOILATION DETECTED: " + installFlag.value + " flag missing at position:" + c.position.toString() + " for command " + c.command +  "\n";
                                    }
                                })
                            }
                        }else{
                            // Check that there is an appropriate install command (one that comes before in the same layer);
                            bashManagerCommands.filter(c => c.command == rule.detection.manager && c.option == manager.installOption[0]).forEach(ic => {
                                //Found a clean option
                                
                                // Find an install command that came before it.
                                // If there is no clean cache command that adheres to the condition this means that there is just none at all.
                                let hasCleanCacheCommand = false;
                                bashManagerCommands.filter(cc => ic.layer == cc.layer && ic.command == cc.command && cc.option == manager.cleanCacheOption[0])
                                .forEach(x => {
                                    if(ic.source.isBefore(x.source)){
                                        hasCleanCacheCommand = true;
                                    }
                                });

                                if(!hasCleanCacheCommand){
                                    //console.log(dirent.name);
                                    //console.log("No Clean cache command found for: " + manager.command);
                                    fileReport += "\tVOILATION DETECTED: No cache clean command detected for " + manager.command + " command at " + ic.position.toString() + "\n";

                                    
                                }
                            });
                        }
                    }
                    break;

                case "NO-RECOMMENDS":
                    if(manager != null){
                        //console.log("Checking for no-recommends");
                        let norecommendsflag = manager.installOptionFlags.find(flag => flag.type == "NO-RECOMMENDS");
                        if(norecommendsflag != undefined){
                            let found = false;
                            bashManagerCommands.filter(c => c.command == rule.detection.manager && c.option == manager.installOption[0]).forEach( c => {
                                if(c.arguments.find(arg => arg == norecommendsflag.value) != undefined){
                                    //console.log("Recommends found");
                                    found = true;
                                } else {
                                    //console.log("found NO-RECOMMENDS issue");
                                    fileReport += "\tVOILATION DETECTED: No " + norecommendsflag.value + " flag detected for " + manager.command + " command at " + c.position.toString() + "\n";
                                }
                            });
                        }
                    }
                    break;
                
                default:
                    //console.log("no such option");
                    break;
            }     
        });

        fs.writeFileSync("./reports/" + dirent.name + ".txt", fileReport);

    }

    log.close();

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