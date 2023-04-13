// Just doing import * from /path/ gives error that the file we are importing does not export a default or does not have a default export. (it has multiple in our case)
import * as ding from './../../Dinghy-main/Dinghy-main/build/index.js';
import * as fs from 'fs';
import {Analyzer} from "./models/analyzer";
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
    // Remove sudo - is actually a smell and should be detected
    commands = commands.filter(w => w != "sudo");

    let idx = commands.filter(w => !w.startsWith("-")).findIndex(x => x == manager.command);
    let option = commands.filter(w => !w.startsWith("-"))[idx+1];

    bashManagerCommand.versionSplitter = manager.packageVersionFormatSplitter;
    bashManagerCommand.command = manager.command;
    bashManagerCommand.option = option;
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

function addAbsoluteSmell(lst, rule){
    let idx: number = lst.findIndex(s => s.rule == rule.code);

    if(idx == -1){
        lst.push({rule: rule.code, times:1});
    } else {
        lst[idx].times += 1;
    }
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
    let sum: number = 0;
    let log : fs.WriteStream = fs.createWriteStream("./logs/" + createLogName(), {flags: 'a'});
    let log2: fs.WriteStream = fs.createWriteStream("./logs/" + "error_files", {flags: 'a'});
    let smells: {rule: string, times: number}[] = [];
    let absoluteSmells: {rule: string, times: number}[] = [];

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
    let testFolder = "./../data/testfiles/";
    let binnacle = "./../data/binnacle/github/deduplicated-sources/";
    let crashed = "./../data/chrashedfiles/";

    // Variable that sets folder for program
    let currentFolder = folder;

    let analyzer: Analyzer = new Analyzer();

    // Create package managers as PackageManager objects
    managers.forEach(pm => {
        packageManagers.push(pm as PackageManager)
    })

    //For loops in for loops - we can improve this on some options, can't we?
    const dir = await fs.promises.opendir(currentFolder);

    for await (const dirent of dir) {
        //TODO split up 
        try{ 
        console.log(dirent.name);
        let fileReport: string = "Report for: " + dirent.name + "\n";
        let ast: ding.nodeType.DockerFile = await ding.dockerfileParser.parseDocker(currentFolder + dirent.name);
        let nodes: ding.nodeType.DockerOpsNodeType[] = ast.find({type:ding.nodeType.BashCommand});
        let set: Set<string> = new Set<string>();
        
        analyzer.temporaryFileAnalysis(ast, fileReport, set);

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
                        //console.log("No such manager found");
                    }else{
                        bashManagerCommands.filter(c => c.command == rule.detection.manager && c.option == manager.installOption[0]).forEach(c => {
                            let requiresVersionPinning: boolean = false;
                            // if(dirent.name == "1c1994e05f61bfab226254e9b510e97547e5d148.Dockerfile"){
                            //     console.log(c.arguments);
                            // }
                            c.arguments.forEach(arg => {
                                if(arg.search(manager.packageVersionFormatSplitter) == -1){
                                    // Check if it is not a requirements.txt file
                                    if(arg.indexOf(".txt") == -1){
                                         //We report in case that we apt-install from a link, as we should specify the version. We don't do this when it comes from a file.
                                         log.write("VIOLATION DETECTED: -- CODE " + rule.code + ": " + arg + " -- no version specified in file\n");
                                         fileReport += "\tVOILATION DETECTED: " + arg + " at position:" + c.position.toString() + " for " + manager.command + " command\n";
                                         set.add(rule.code);
                                         addAbsoluteSmell(absoluteSmells, rule);
                                         requiresVersionPinning = true;
                                    }
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
                                    set.add(rule.code);
                                    addAbsoluteSmell(absoluteSmells, rule);
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
                                        addAbsoluteSmell(absoluteSmells, rule);
                                        set.add(rule.code);
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
                                    set.add(rule.code);
                                    fileReport += "\tVOILATION DETECTED: No cache clean command detected for " + manager.command + " command at " + ic.position.toString() + "\n";
                                    addAbsoluteSmell(absoluteSmells, rule);
                                    
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
                                    addAbsoluteSmell(absoluteSmells, rule);
                                    set.add(rule.code);
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

        fileReport += "RULE DETECTIONS: ";
        fileReport += Array.from(set).join(" ");
        fs.writeFileSync("./reports/" + dirent.name + ".txt", fileReport);

        set.forEach(smell => {
            let idx: number = smells.findIndex(s => s.rule == smell);

            if(idx == - 1){
                smells.push({rule: smell, times: 1});
            } else {
                smells[idx].times += 1;
            }
        });

    } catch{
        log2.write(dirent.name + "\n");
        console.log("ERROR");
    }

    }

    log.close();
    //log2.write(smells);
    log2.close();
    // Relative smells are fine but we are missing a lot of the DL42
    console.log("relative");
    console.log(smells)
    // The problem with absolute smells is that Hadolint does not report them so the number is much higher for the tool.
    console.log("absolute");
    console.log(absoluteSmells);

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