import { DockerCopy } from '../../../Dinghy-main/Dinghy-main/build/docker-type.js';
import * as ding from './../../../Dinghy-main/Dinghy-main/build/index.js';
import {File} from "./file.js"
import { Logger } from './logger.js';
import { SmellBox } from './smellbox.js';

/**
 * Class that can perform analysis on Dockerfile
 */
export class Analyzer {

    constructor(){
        
    }

    /**
     * Procedure that performs a temporary-file smell analysis on the file.
     * @param ast 
     */
    temporaryFileAnalysis(ast:ding.nodeType.DockerFile, logger: Logger, set: Set<string>, fixInfo: {root: ding.nodeType.DockerFile, list: any[]}, smellBox: SmellBox, absoluteSmells: {rule: string, times: number}[]){
        let args: {key:string, value:string, updatedInLayer?:number}[] = [];
        let envs: {key:string, value:string, updatedInLayer?:number}[] = [];
        let exports: {key: string, value:string, updateInLayer?:number}[] = [];
        let state = {hasCopiedEntireContext: false, hasCopiedEntireContextLayer: -1, hasCopiedEntireContextCommand: null, lastCopyLayer: -1, installLayer: -1, installCommand: null};


        // Add introducedCommand, deletedCommand, compressedCommand such that it can be used as relevant statements that hook into the AST.
        // let files: {absolutePath: string, 
        //     file: string, 
        //     extractedLayer?:number, 
        //     extractedStatement?:ding.nodeType.BashCommand,
        //     introducedLayer?:number, 
        //     introducedStatement?:ding.nodeType.DockerOpsNodeType, 
        //     deletedLayer?:number, 
        //     deletedStatement?:ding.nodeType.BashCommand,
        //     urlOrigin?:boolean, 
        //     isDirectory?:boolean, 
        //     isCompressed:boolean,
        //     introducedBy: "COPY"|"ADD"|"BUILT-IN"}[] = [];

        let files: File[] = [];

        let containerpath = "/";

        /**
         * Procedure that adds a docker ARG to the ARGS.
         * @param arg DockerArg
         */
        function addArgToArgs(arg: ding.nodeType.DockerArg){
            let key: string = (arg.getChild(ding.nodeType.DockerName) as ding.nodeType.DockerOpsValueNode).value;
            let value: string = (arg.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode) != undefined ? (arg.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode).value  : "";
            
            if(value == ""){
                value = "https://"
            }

            let idx = args.findIndex(x => x.key == key);

            if(idx != -1){
                args.splice(idx, 1);
            }

            args.push({
                key: key,
                value: value,
                updatedInLayer: arg.layer
            });
        }

        /**
         * Procedure that returns wheter a file is compressed or not
         * @param file 
         * @returns 
         */
        function fileIsCompressed(file): boolean{
            return file.toString().includes(".tar.gz") || file.toString().includes(".tar.xz") || file.toString().includes(".tar.bzip2");
        }

        /**
         * Procedure that resolves possible ARGS in a string value.
         * @param str string potentionally containing ARGS
         * @returns string without ARGS
         */
        function resolveArgsAndEnvsInString(str: string): string{
            let temp: string = str;

            let stringUpdated: boolean = false;
            args.forEach(arg => {

                // if(arg.key == str){
                //     return resolveArgsAndEnvsInString(arg.value);
                // }

                let substr: string = "${" + arg.key + "}";
                let idx: number = str.indexOf(substr);

                if(idx != -1){
                    str = str.replace(substr, arg.value);
                    idx = str.indexOf(substr);
                    stringUpdated = true;
                }
            });

            args.forEach(arg => {

                // if(arg.key == str){
                //     return resolveArgsAndEnvsInString(arg.value);
                // }

                let substr: string = "$" + arg.key;
                let idx: number = str.indexOf(substr);

                if(idx != -1){
                    str = str.replace(substr, arg.value);
                    idx = str.indexOf(substr);
                    stringUpdated = true;
                }
            });

            envs.forEach(env => {

                // if(env.key == str){
                //     return resolveArgsAndEnvsInString(env.value);
                // }

                let substr: string = "$" + env.key;
                let idx: number = str.indexOf(substr);

                if(idx != -1){
                    str = str.replace(substr, env.value);
                    idx = str.indexOf(substr);
                    stringUpdated = true;
                }
            })

            envs.forEach(env => {
                let substr: string = "${" + env.key + "}";
                let idx: number = str.indexOf(substr);

                if(idx != -1){
                    str = str.replace(substr, env.value);
                    idx = str.indexOf(substr);
                    stringUpdated = true;
                }
            });

            exports.forEach(exp => {
                // // In case that string is key
                // if(exp.key == str){
                //     return resolveArgsAndEnvsInString(exp.value);
                // }

                let substr: string = "${" + exp.key + "}";
                let idx: number = str.indexOf(substr);

                if(idx != -1){
                    str = str.replace(substr, exp.value);
                    idx = str.indexOf(substr);
                    stringUpdated = true;
                }
            });

            exports.forEach(exp => {
                // // In case that string is key
                // if(exp.key == str){
                //     return resolveArgsAndEnvsInString(exp.value);
                // }

                let substr: string = "$" + exp.key;
                let idx: number = str.indexOf(substr);

                if(idx != -1){
                    str = str.replace(substr, exp.value);
                    idx = str.indexOf(substr);
                    stringUpdated = true;
                }
            });

            // Keep iterating as replacements may introduce new args until no valid replacement is found
            if(stringUpdated && temp != str){
                return resolveArgsAndEnvsInString(str);
            } else {    

                return str;
            } 
        }

        /**
         * Procedure that adds ENVs to ENVS
         * @param env 
         */
        function addEvnToEnvs(env: ding.nodeType.DockerEnv){
            let newEnvs: string[]= env.toString().replace(/\n/g, "").replace("ENV", "").split("\\").map(x => x.trim());

            newEnvs.forEach(newEnv => {
                let keyValuePair: string[];

                if(newEnv.includes("=")){
                    keyValuePair = newEnv.split("=");
                } else {
                    keyValuePair = newEnv.split(" ");
                }

                let key: string = keyValuePair[0];
                let value: string = keyValuePair[1];
                let idx: number = envs.findIndex(x => x.key == key);

                if(idx != -1){
                    envs.splice(idx, 1);
                }

                envs.push({
                    key: key,
                    value: value,
                    updatedInLayer: env.layer
                });
            });


            // //let key: string = (env.getChild(ding.nodeType.DockerName) as ding.nodeType.DockerOpsValueNode).value;
            // //let value: string = (env.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode) != undefined ? (env.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode).value  : "";

            // if(key.indexOf("=") != -1 && value == ""){
            //     let keyValuePair: string[] = key.split("=");
            //     key = keyValuePair[0];
            //     value = keyValuePair[1];
            // } else if (key.indexOf("=") != -1 && value != ""){
            //     let keyValuePair: string[] = (key + " " + value).split("=");
            //     key = keyValuePair[0];
            //     value = keyValuePair[1];
            // }

            // let idx: number = envs.findIndex(x => x.key == key);

            // if(idx != -1){
            //     envs = envs.splice(idx, 1);
            // }

            // envs.push({
            //     key: key,
            //     value: value.replace(/\"/g, ""),
            //     updatedInLayer: env.layer
            // });
        }

        function addExportToExports(exp: string[], node: ding.nodeType.BashCommand){
            exp = exp.filter(w => w != "export");
            
            if(exp.length == 0 || exp.includes("cd")){
                return;
            }

            let split: string[] = exp[0].split("=");
            let key: string = split[0];
            let value: string = split[1];

            let idx: number = exports.findIndex(x => x.key == key);

            if(idx != -1){
                exports.splice(idx, 1);
            }

            exports.push({
                key: key,
                value: value,
                updateInLayer: node.layer
            });
        }

        function removeExtensions(str: string): string | undefined{
            let substrings: string[] = str.split(".");
            for(let i: number = 0; i < substrings.length; i++){
                if(substrings[i] == "tar"){
                    substrings.splice(i);
                    return substrings.join(".");
                }
            }
        }

        function resolveAddStatement(add: ding.nodeType.DockerAdd){
            let sources: ding.nodeType.DockerAddSource[] = add.getChildren(ding.nodeType.DockerAddSource);
            let target: ding.nodeType.DockerAddTarget = add.getChild(ding.nodeType.DockerAddTarget);
            let temp: string = "";
            let finalPath: string = "";

            if(target.toString().startsWith("./") || target.toString().startsWith(".")){
                if(containerpath == "/"){
                    containerpath = "";
                }

                finalPath = containerpath + "/" + target.toString().slice(2);
            } else {
                finalPath = target.toString();
            }

            temp = finalPath;

            sources.forEach(source => {
                finalPath = temp;
                let file = source.toString();
                let isUrl = false;
                let isDecompressedAndExtracted = false;

                if(file == "." ||file == "./"){
                    file = "/entire_build_context";
                      // COPY . . || COPY . /foo
                
                    state.hasCopiedEntireContext = true;
                    state.hasCopiedEntireContextLayer = add.layer;
                    state.hasCopiedEntireContextCommand = add;
                    state.lastCopyLayer = add.layer;
                
                } else {
                    state.lastCopyLayer = add.layer;
                }

                if(source.toString().startsWith("https") || source.toString().startsWith("http")){
                    isUrl = true;
                    let splitSource: string[] = source.toString().split("/");
                    file = splitSource[splitSource.length-1];    
                }

                if(source.toString().includes(".tar.gz") || source.toString().includes(".tar.xz") || source.toString().includes(".tar.bzip2")){
                    if(!isUrl){
                        isDecompressedAndExtracted = true;
                        file = removeExtensions(file);
                        return;
                    }
                }

                file = resolveArgsAndEnvsInString(file);

                if(!finalPath.includes(source.toString())){
                    if(finalPath[finalPath.length - 1] != "/" && file[0] != "/"){
                        finalPath += "/" + file;
                    } else {
                        finalPath += file;
                    }
                }

                files.push({
                    file: file,
                    absolutePath: finalPath,
                    introducedLayer: add.layer,
                    introducedStatement: add,
                    introducedBy: "ADD",
                    urlOrigin: isUrl,
                    isCompressed: fileIsCompressed(file),
                    containerPath: containerpath,
                });        

            });
        }

        // Tinker with the target path as that one is not right yet. - Lot of duplicated code
        // Situation in ace64 where files are added by add statement and thus extracted and deleted in the same layer
        // Remote ADDs are NOT unpacked - therefore it is deleted later. Solution is to download to local context and then add it to directory, or to use WGET or CURL in the same layer.
        function resolveCopyStatement(copy: ding.nodeType.DockerCopy){
            let sources: ding.nodeType.DockerCopySource[] = copy.getChildren(ding.nodeType.DockerCopySource);
            let target: ding.nodeType.DockerCopyTarget = copy.getChild(ding.nodeType.DockerCopyTarget);
            let temp: string = "";

            let finalPath: string = "";

            if(target.toString().startsWith("./") || target.toString().startsWith(".")){
                if(containerpath == "/"){
                    containerpath = "";
                }

                finalPath = containerpath + "/" + target.toString().slice(2);
            } else {
                finalPath = target.toString();
            }

            temp = finalPath;

            sources.forEach(source => {
                finalPath = temp;
                let file = source.toString();

                if(file == "." ||file == "./"){
                    file = "/entire_build_context";
                    state.hasCopiedEntireContext = true;
                    state.hasCopiedEntireContextLayer = copy.layer;
                    state.hasCopiedEntireContextCommand = copy;
                    state.lastCopyLayer = copy.layer;
                } else {
                    state.lastCopyLayer = copy.layer;
                }

                if(file.startsWith("https") || file.startsWith("http")){
                    let splitSource: string[] = file.split("/");
                    file = splitSource[splitSource.length-1];
                }

                file = resolveArgsAndEnvsInString(file);

                if(!finalPath.includes(file)){
                    if(finalPath[finalPath.length - 1] != "/" && file[0] != "/"){
                        finalPath += "/" + file;
                    } else {
                        finalPath += file;
                    }
                }

                files.push({
                    file: file,
                    absolutePath: finalPath,
                    introducedLayer: copy.layer,
                    introducedStatement: copy,
                    introducedBy: "COPY",
                    isCompressed: fileIsCompressed(file),
                    containerPath: temp,
                });
            });
        }

        function resolveWget(wget: string[], node: ding.nodeType.BashCommand){
            // Clear all the flags
            wget = wget.filter(w => !w.startsWith("-"));
            
            
            // Check for directory?
            wget.forEach(arg => {
                let cleanArg: string = resolveArgsAndEnvsInString(arg).replace(/\"/g, "").replace(/\'/g, "");

                if(cleanArg.startsWith("https://") || cleanArg.startsWith("http://") || cleanArg.startsWith("ftp://")){
                    let splitArg: string[] = cleanArg.split("/");
                    let file: string = splitArg[splitArg.length - 1];

                    if(containerpath == "/"){
                        containerpath = "";
                    }

                    files.push({
                        absolutePath: containerpath + "/" + file,
                        file: file,
                        introducedLayer: node.layer,
                        introducedStatement: node,
                        introducedBy: "BUILT-IN",
                        isCompressed: fileIsCompressed(file),
                        containerPath: containerpath,
                    });
                }
            });
        }

        
        function resolveCurl(curl: string[],  node: ding.nodeType.BashCommand){
            // Clear all the flags

            for(let i: number = 0; i < curl.length; i++){
                if(curl[i] == "-o" || curl[i]=="--output"){
                    let absoluteFile: string = curl[i+1];
                    let absoluteFileSplit: string[] = absoluteFile.split("/");
                    let file: string = absoluteFileSplit[absoluteFileSplit.length - 1];

                    files.push({
                        absolutePath: absoluteFile,
                        file: file, 
                        introducedLayer: node.layer,
                        introducedBy: "BUILT-IN",
                        isCompressed: fileIsCompressed(file),
                        containerPath: containerpath,
                    });

                    return;
                }
            }

            curl = curl.filter(w => !w.startsWith("-"));

            //Check for directory?
            curl.forEach(arg => {
                let cleanArg: string = resolveArgsAndEnvsInString(arg).replace(/\"/g, "").replace(/\'/g, "");

                if(cleanArg.startsWith("https://") || cleanArg.startsWith("http://") || cleanArg.startsWith("ftp://")){
                    let splitArg: string[] = cleanArg.split("/");
                    let file: string = splitArg[splitArg.length - 1];
                    

                    if(containerpath == "/"){
                        containerpath = "";
                    }

                    files.push({
                        absolutePath: containerpath + "/" + file,
                        file: file, 
                        introducedLayer: node.layer,
                        introducedBy: "BUILT-IN",
                        isCompressed: fileIsCompressed(file),
                        containerPath: containerpath,
                    });
                }
            });
        }

        function resolveTar(tar: string[],  node: ding.nodeType.BashCommand){
            // If no file is present - it may be so that the tar is piped to the curl or wget which writes to stdout. 
            tar = tar.filter(w => !w.startsWith("-") && w.length > 1).filter(w => w != "tar");

            let matchFound: boolean = false;

            // Look for file
            tar.forEach(arg => {
                files.forEach(file => {
                    let resolvedFileName = resolveArgsAndEnvsInString(arg.replace(/\"/g, ""));
                    
                    if(resolvedFileName == file.file || resolvedFileName == file.absolutePath){
                        file.extractedLayer = node.layer;
                        file.extractedStatement = node
                        matchFound = true;
                    }
                });
            });

            if(matchFound){
                //console.log("match found - adjusting ...");
            }else{
                //console.log("We are checking for piping");
                // Check for piping - current only checks back 1 statement.
                if(node.parent.parent != undefined && node.parent.parent.type == "BASH-CONDITION-BINARY"){
                    if(node.parent.parent.children[1].type == 'BASH-CONDITION-BINARY-OP'){
                        if(node.parent.parent.children[1].toString() == "|"){

                            let command = node.parent.parent.children[0].toString().toString().replace(/\r?\n/g, " ").replace(/\\/g, " ").split(" ").filter(w => w != "").filter(w => w != "sudo").filter(w => !w.startsWith("-"));

                            // Piped command is not wget or curl
                            if(!command.includes("wget") && !command.includes("/usr/bin/wget") && !command.includes("curl")){
                                return;
                            }

                            let lastFile : File = files[files.length - 1];

                            // if(lastFile == undefined){
                            //     console.log("piped file not found");
                            //     return;
                            // }


                            command.forEach(arg => {
                                let resolvedFileName: string = resolveArgsAndEnvsInString(arg.replace(/\"/g, ""));

                                if(resolvedFileName.includes(lastFile.file)){
                                    lastFile.extractedLayer = node.layer;
                                    lastFile.extractedStatement = node;
                                }
                            });
                        }
                    }
                }
            }
        }


        function resolveRm(rm: string[],  node: ding.nodeType.BashCommand) {
            rm = rm.filter(w => !w.startsWith("-")).filter(w => w != "rm").map(w => w.replace(/\"/g, ""));

            let matchFound: boolean = false;

            rm.forEach(arg => {
                files.forEach(file => {
                    let resolvedFileName = resolveArgsAndEnvsInString(arg);

                    if(resolvedFileName == file.absolutePath || (resolvedFileName == file.file && file.absolutePath == containerpath  + "/" + resolvedFileName)){
                        file.deletedLayer = node.layer;
                        file.deletedStatement = node;
                        matchFound = true;
                    } else if(resolvedFileName == file.file && file.absolutePath != containerpath + "/" + resolvedFileName) {
                        console.log("trying to delete a file that does not exist at this location.");
                    }
                });
            });

            if(matchFound){
                //console.log("Match found -- adjusting delete");
            } else {
                //console.log("No match found - check for piping?");
            }
        }

        function resolveCd(cd: string[], node: ding.nodeType.BashCommand){
            cd = cd.filter(w => !w.startsWith("-")).filter(w => w != "cd");
            let dockerPath: string = cd[0];
            
            if(dockerPath == undefined){
                return;
            }
            setContainerPath(dockerPath);
        }

        function resolveWorkDir(workdir: ding.nodeType.DockerWorkdir){
            let dockerPath: string = workdir.getChild(ding.nodeType.DockerPath).value;
            setContainerPath(dockerPath);
        }

        function setContainerPath(path: string){
            // If path is absolute
           
            if(path[0] == "/"){
                // Absolute path
                containerpath = path;
            } else {
                // Relative path
                let containerPathParts: string[] = containerpath.split("/").filter(part => part != "");
                let pathParts: string[] = path.split("/").filter(part => part != "");
            
            
                pathParts.forEach(part => {
                    switch(part){
                        case ".":
                            break;
                        case "..":
                            containerPathParts.splice(containerPathParts.length - 1);
                            break;
                        default:
                            containerPathParts.push(part);
                    }
                });

                if(containerPathParts.length > 0){
                    containerpath = "/" + containerPathParts.join("/");
                }else{
                    containerpath = "/";
                }
            }
        }

        function resolvePython(statements: string[], instruction: ding.nodeType.BashCommand): void{
            let stmt: String[] = instruction.toString()
                .replace(/\r?\n/g, " ")
                .replace(/\\/g, " ")
                .split(" ")
                .filter(w => w != "")
                .filter(w => w != "sudo")
                .filter(w => !w.startsWith("-"))
                .filter(w => w != "RUN")
                .filter(w => w != "python")
                .filter(w => w != "python3");
            

            if(stmt.includes("pip") && stmt.includes("install") && stmt.find(e => e.includes(".txt"))){
                let requirements: string = stmt.find(e => e.includes(".txt")).toString();

                let fileIsFetchedOnline = files.reduce((a, b) => {
                    return a || ((b.urlOrigin != undefined && b.urlOrigin) && b.absolutePath.includes(requirements));
                }, false);
                
                if(state.hasCopiedEntireContext && !fileIsFetchedOnline){
                    // Check files for file imported by url - otherwise it must be from context which was entirely copied.
                    logger.log("VIOLATION DETECTED of rule DL9020: Context churn for pip at position " + instruction.position.toString());
                    set.add("DL9020");
                    smellBox.addSmell("DL9020");
                }

            } else if (stmt.includes("pip3") && stmt.includes("install") && stmt.find(e => e.includes(".txt"))){
                //Just pip3
                let requirements: string = stmt.find(e => e.includes(".txt")).toString();

                let fileIsFetchedOnline = files.reduce((a, b) => {
                    return a || ((b.urlOrigin != undefined && b.urlOrigin) && b.absolutePath.includes(requirements));
                }, false);
                
                if(state.hasCopiedEntireContext && !fileIsFetchedOnline){
                    // Check files for file imported by url - otherwise it must be from context which was entirely copied.
                    logger.log("VIOLATION DETECTED of rule DL9020: Context churn for pip at position " + instruction.position.toString());
                    set.add("DL9020");
                    smellBox.addSmell("DL9020");
                }
            }
        }

        function resolveNpm(statements: string[], instruction: ding.nodeType.BashCommand): void{

            let stmt: string[] = instruction.toString()
                .replace(/\r?\n/g, " ")
                .replace(/\\/g, " ")
                .split(" ")
                .filter(w => w != "")
                .filter(w => w != "sudo")
                .filter(w => !w.startsWith("-"))
                .filter(w => w != "RUN");

            if(stmt.length == 2 && stmt[0] == "npm" && stmt[1] == "install"){
                // Added by ADD through urlorigin doesn't count
                // Keep in mind multi-stage builds when copying from other images. Meaning we need an mapping of files for different images and keep in mind the copying. Do we need to simulate that? Would complicate things ... but we'd be the first

                if(state.hasCopiedEntireContext){
                    logger.log("VIOLATION DETECTED of rule DL9000: Context churn for npm at position " + instruction.position.toString());
                    set.add("DL9000");
                    smellBox.addSmell("DL9000");
                }

                let fileContainsPackageJson: boolean = false;
                let fileContainsPackageLockJson: boolean = false;
                let relevantFiles: File[] = [];
                //let relevantFile: File = [];

                if(files.length == 1){
                    let file: File = files[0];
                    let fileContainerPath: string = file.containerPath;
                    let currentContainerPath: string = containerpath;

                    // Even if that file is introduced, it doesn't matter because it is the only statement. 
                    // Therefore it still needs to be split up and treated as if it doesn't exist. 
                    // This shouldn't actually happen because you copy over a package but have no application at all? 
                    // Unless it's something built in which I don't think happens
                    if(file.file.includes("package.json")){
                        // The file copied 
                        return;
                    }

                    if(!fileContainerPath.endsWith("/")){
                        fileContainerPath += "/";
                    }

                    if(!currentContainerPath.endsWith("/")){
                        currentContainerPath += "/";
                    }

                    if(currentContainerPath == fileContainerPath){
                        switch(file.introducedBy){
                            case "COPY":
                                console.log("single file same path detected");
                                fixInfo.list.push({
                                    isManagerRelated: false,
                                    code: "TD0001",
                                    manager: null,
                                    node: null,
                                    context: {
                                        // For now we assume that this is the only case that we fix.
                                        file: file,
                                        runstatement: instruction
                                    } 
                                });
                                break;
                            case "ADD":
                                if(file.isCompressed && file.urlOrigin){
                                    console.log("temporary file error, might want to use wget for this. cannot handle this")
                                } else if(file.urlOrigin) {
                                    console.log("cannot help either");
                                } else {
                                    console.log("Can help");
                                }
                                break;
                            case "BUILT-IN":
                                console.log("Not handling built-in at the moment");
                                break;
                        }
                    } else {
                        // Directory was copied and WORKDIR was probably set to location or cd'd to it. This means we need to fix the WORKDIR as well.
                        console.log("this is not the same, figure out the difference for the fix");
                    }

                    console.log(currentContainerPath);
                    console.log(fileContainerPath);

                } else {
                    console.log("multiple files not supported at the moment");
                    // files.forEach(file => {
                    //     if(file.file == "package.json" && file.containerPath == containerpath){
                    //         fileContainsPackageJson = true;
                    //     }
    
                    //     if(file.file == "package-lock.json" && file.containerPath == containerpath){
                    //         fileContainsPackageLockJson = true;
                    //     }
    
                    //     if(file.introducedLayer < instruction.layer){
                    //         let fileContainerPath: string = file.containerPath;
                    //         let currentContainerPath: string = containerpath;
    
                    //         if(!fileContainerPath.endsWith("/")){
                    //             fileContainerPath += "/";
                    //         }
    
                    //         if(!currentContainerPath.endsWith("/")){
                    //             currentContainerPath += "/";
                    //         }
    
    
                    //         // paths can end with / or can end without it.
    
                    //         console.log("comparing containerpaths");
                    //         console.log("file containerpath: " + fileContainerPath);
                    //         console.log("containerpath:" + currentContainerPath);
                            
                    //         console.log(file);
                            
                    //     }
                    // });
                }

                // console.log("**RESULT**\n");
                // console.log(containerpath);
                // console.log(relevantFiles)
                // console.log("package.json: " + fileContainsPackageJson);
                // console.log("package-lock.json: " + fileContainsPackageLockJson);
                // console.log("\n");
            } else {
                console.log("this is a statement installin dependencies");
            }
        }



        function resolveRunStatement(run: ding.nodeType.DockerRun){
            //Get all the commands - they are in sequential order and loop/branch insensitive
            let commands: ding.nodeType.BashCommand[] = run.find({type:ding.nodeType.BashCommand}) as ding.nodeType.BashCommand[];

            commands.forEach(command => {
                // we are under the assumption that the only word that could come before the actual command is sudo. Thus after removing sudo, we assume the first wordt to be the command
                let splitCommand: string[] = command.toString().replace(/\r?\n/g, " ").replace(/\\/g, " ").split(" ").filter(w => w != "").filter(w => w != "sudo");
                switch(splitCommand[0]){
                    case "wget":
                        //console.log("RUN-WGET");
                        resolveWget(splitCommand, command);
                        break;
                    case "/usr/bin/wget":
                        resolveWget(splitCommand, command);
                        break;
                    case "tar":
                        //console.log("RUN-TAR");
                        resolveTar(splitCommand, command);
                    case "curl":
                        //console.log("RUN-CURL");
                        resolveCurl(splitCommand, command);
                        break;
                    case "rm":
                        //console.log("RUN-RM");
                        resolveRm(splitCommand, command);
                        break;
                    case "cd":
                        //console.log("RUN-CD");
                        resolveCd(splitCommand, command);
                        break;
                    case "export":
                        //console.log("RUN-EXPORT");
                        addExportToExports(splitCommand, command);
                        break;
                    case "npm":
                        // Look for cache optimization
                        resolveNpm(splitCommand, command);
                        break;
                    default:
                        if(splitCommand[0].includes("=")){
                            addExportToExports(splitCommand, command);
                        } else {
                            resolvePython(splitCommand, command);
                        }
                        break;
                }
            });

        }

        /**
         * Procedure that serves as a hatch for the different kind of Docker instructions, which can all be assumed to be different layers.
         * @param instruction 
         */
        function handleInstruction(instruction: ding.nodeType.DockerOpsNodeType){
            switch(instruction.type){
                case 'DOCKER-ARG': 
                    //console.log("ARG");
                    addArgToArgs(instruction as ding.nodeType.DockerArg);
                    break;
                case 'DOCKER-ENV':
                    //console.log(instruction.toString());
                    addEvnToEnvs(instruction as ding.nodeType.DockerEnv);
                    break;
                case 'DOCKER-ADD':
                    resolveAddStatement(instruction as ding.nodeType.DockerAdd);
                    break;
                case 'DOCKER-COPY':
                    //console.log("COPY");
                    resolveCopyStatement(instruction as ding.nodeType.DockerCopy);
                    break;
                case'DOCKER-RUN':
                    //console.log("RUN");
                    resolveRunStatement(instruction as ding.nodeType.DockerRun);
                    break;
                case 'DOCKER-WORKDIR':
                    //console.log("WORKDIR");
                    resolveWorkDir(instruction as ding.nodeType.DockerWorkdir);
                default:
                    break;
            }
        }

        ast.children.forEach(dockerInstruction => {
            // Handling each instruction seperately ensures we handle one layer at a time, temporary or final doesn't matter.
            // Do we need an internal model of the file structure?
            handleInstruction(dockerInstruction);
        });

        function analyseResult(): void{
            //TODO add another smell: ADD with urlorigin and extracted and deleted -- no point in deleting, should be wget/url in one go.
            files.forEach(file => {
                if(file.introducedLayer != undefined && file.deletedLayer != undefined && file.introducedLayer != file.deletedLayer){
                    switch(file.introducedBy){
                        case "ADD":
                            logger.log("VIOLATION DETECTED of rule DL9013: ADD/rm temporary file smell for file " + file.file.toString());
                            //fileReport += "\tVOILATION DETECTED: ADD/rm temporary file smell for file" + file.file + "\n";
                            //DL9013
                            set.add("DL9013");
                            smellBox.addSmell("DL9013");
                            // NO fix unless we take it from a source like wget/curl- maybe delete the deleting command?
                            break;
                        case "COPY":
                            logger.log("VIOLATION DETECTED of rule DL9014: COPY/rm temporary file smell for file " + file.file.toString());
                            //fileReport += "\tVOILATION DETECTED: COPY/rm temporary file smell for file" + file.file + "\n";
                            set.add("DL9014"); //DL9014
                            smellBox.addSmell("DL9014");
                            // No fix unless we take from a source like wget/curl - maybe delete the deleting command?
                            break;
                        case "BUILT-IN":
                            logger.log("VIOLATION DETECTED of rule DL9015: BUILT-IN/rm temporary file smell for file " + file.file.toString());
                            //fileReport += "\tVOILATION DETECTED: BUILT-IN/rm temporary file smell for file" + file.file + "\n";
                            set.add("DL9015"); //DL9015
                            smellBox.addSmell("DL9015");

                            // Find the relevant nodes with context, can be built up given that we have a status for each file
                            // We need to hook the relevant statements to the files. 
                            fixInfo.list.push({
                                isManagerRelated: false,
                                code: "DL9015",
                                manager: null,
                                node: null,
                                context: file //TODO
                            });
                            break;
                    }
                }else if (file.introducedLayer != undefined && file.extractedLayer != undefined && file.isCompressed && file.deletedLayer == undefined){
                    // Are we sure that when a file is introduced it isn't necessary a format that's been extracted?
                    // Double check this - would be a silly fucking mistake

                    switch(file.introducedBy){
                        case "ADD":
                            if(file.urlOrigin){
                                logger.log("VIOLATION DETECTED of rule DL9016: ADD introduced compressed file which was decompressed but not deleted " + file.file.toString());
                                //fileReport += "\tVOILATION DETECTED: ADD introduced compressed file which was decompressed but not deleted:" + file.file + "\n";
                                set.add("DL9016"); //DL9016
                                smellBox.addSmell("DL9016");
                            }
                            
                            break;
                        case "COPY":
                            logger.log("VIOLATION DETECTED of rule DL9017: COPY introduced compressed file which was decompressed  but not deleted " + file.file.toString());
                            //fileReport += "\tVOILATION DETECTED: COPY introduced compressed file which was decompressed  but not deleted:" + file.file + "\n";
                            set.add("DL9017"); //DL9017
                            smellBox.addSmell("DL9017");
                            break;
                            
                        case "BUILT-IN":
                            logger.log("VIOLATION DETECTED of rule DL9018: BUILT-IN introduced compressed file which was decompressed but not deleted " + file.file.toString());
                            //fileReport += "\tVOILATION DETECTED: BUILT-IN introduced compressed file which was decompressed but not deleted:" + file.file + "\n";
                            set.add("DL9018"); //DL9018
                            smellBox.addSmell("DL9018");
                            // can be fixed
                            fixInfo.list.push({
                                isManagerRelated: false,
                                code: "DL9018",
                                manager: null,
                                node: null,
                                context: file //TODO
                            });
                            break;
                    }
                }

                if(file.introducedLayer != undefined && file.introducedBy == "ADD" && file.isCompressed && file.urlOrigin && file.deletedLayer != undefined){
                    logger.log("VIOLATION DETECTED of rule DL9019: compressed file introduced from URL through ADD " + file.file.toString());
                    //fileReport += "\tVOILATION DETECTED: compressed file introduced from URL through ADD :" + file.file + "\n";
                    set.add("DL9019"); //DL9019
                    smellBox.addSmell("DL9019");
                    // can be fixed by getting it from wget or url, as ADD doesn't decompress
                    fixInfo.list.push({
                        isManagerRelated: false,
                        code: "DL9019",
                        manager: null,
                        node: null,
                        context: file //TODO
                    });
                }

                if(file.introducedLayer != undefined && file.introducedBy == "COPY" && file.isCompressed && file.extractedLayer != undefined){
                    logger.log("VIOLATION DETECTED of rule DL3010: replace COPY instruction and extract statement with ADD instruction for " + file.file.toString());
                    //fileReport += "\tVOILATION DETECTED: replace COPY and extract statement with ADD :" + file.file + "\n";
                    set.add("DL3010");
                    smellBox.addSmell("DL3010");

                    // Solved by replacing COPY by add and deleting extract statement. (this means - keep track of destination too!)
                    fixInfo.list.push({
                        isManagerRelated: false,
                        code: "DL9019",
                        manager: null,
                        node: null,
                        context: file //TODO
                    });
                }
            });
        }

        /**
         * Procedure that dumps environmental information to the console -- TODO deal with . being copied over
         */
        function infoDump(): void{
            console.log("******");
            console.log("This info dump contains all the information about the environment that is being kept on the Dockerfile");
            console.log("Args: ");
            console.log(args);
            console.log("Envs: ");
            console.log(envs);
            console.log("Exports: ");
            console.log(exports);
            console.log("files: ");
            console.log(files);
            console.log("*****");
        }

        // Needs to be enabled to find smells
        analyseResult();
        //console.log(fileReport);
        //infoDump();
    }

    consecutiveRunInstructionAnalysis(ast:ding.nodeType.DockerFile, logger: Logger, set: Set<string>, fixInfo: {root: ding.nodeType.DockerFile, list: any[]}, smellBox: SmellBox, absoluteSmells: {rule: string, times: number}[]){
        //TODO Maybe be more specific such that a Bashscript only has one child that is a BashCommand
        /**
         * Procedure that serves as a hatch for the different kind of Docker instructions, which can all be assumed to be different layers.
         * @param instruction 
         */
         function handleInstruction(instruction: ding.nodeType.DockerOpsNodeType){
            switch(instruction.type){
                case'DOCKER-RUN':
                    let instr: string = instruction.getChild(ding.nodeType.BashScript).toString();

                    if((instr.includes("&&") || instr.includes(";")) && !instr.includes("--mount")){
                        consecutiveRunInstruction = 0;
                        relevantInstructions = [];
                    } else {
                        consecutiveRunInstruction += 1;
                        relevantInstructions.push(instruction as ding.nodeType.DockerRun);

                        if(consecutiveRunInstruction >= 3){
                            fixInfo.list.push({
                                isManagerRelated: false,
                                code: "DL3059",
                                manager: null,
                                node: instruction.parent,
                                context: relevantInstructions
                            });

                            logger.logViolation("VOILATION DETECTED: Multiple consecutive RUN instructions at position " + instruction.position.toString());
                            //fileReport += "\tVOILATION DETECTED: Multiple consecutive RUN instructions \n";
                            set.add("DL3059");
                            smellBox.addSmell("DL3059");
                        }
                    }
                    
                    break;
                default:
                    consecutiveRunInstruction = 0;
                    break;
            }
        }

        logger.log("Checking rule DL3059 -- Multiple consecutive RUN instructions at position");
        let consecutiveRunInstruction: number = 0;
        let relevantInstructions: ding.nodeType.DockerRun[] = [];

        ast.children.forEach(dockerInstruction => {
            // Handling each instruction seperately ensures we handle one layer at a time, temporary or final doesn't matter.
            // Do we need an internal model of the file structure?
            handleInstruction(dockerInstruction);
        });
    }

    lowChurnAnalysis(ast:ding.nodeType.DockerFile, fileReport: string, set: Set<string>, fixInfo: {root: ding.nodeType.DockerFile, list: any[]}){
        /**
        * Procedure that serves as a hatch for the different kind of Docker instructions, which can all be assumed to be different layers.
        * @param instruction 
        */
        function handleInstruction(instruction: ding.nodeType.DockerOpsNodeType){
           switch(instruction.type){
                case'DOCKER-COPY':
                    handleCopy(instruction as ding.nodeType.DockerCopy);
                    break;
                case 'DOCKER-RUN':
                    handleRun(instruction as ding.nodeType.DockerRun);
                    break;
                default:
                    break;
           }
       }

       function handleCopy(instruction: ding.nodeType.DockerCopy): void{
            if(instruction.children.length != 3){
                return; //Not amazing solution, what about . . . or other combinations when there are MORE? More bad practices! -- More concrete instances that we can't apply. 

            }
    
            let source: ding.nodeType.DockerPath = instruction.getChild(ding.nodeType.DockerCopySource).getChild(ding.nodeType.DockerPath);
            let target: ding.nodeType.DockerPath = instruction.getChild(ding.nodeType.DockerCopyTarget).getChild(ding.nodeType.DockerPath);

            // COPY . . || COPY . /foo
            if(source.value == "."){
                state.hasCopiedEntireContext = true;
                state.hasCopiedEntireContextLayer = instruction.layer;
                state.hasCopiedEntireContextCommand = instruction;
                state.lastCopyLayer = instruction.layer;
                relevantInstructions.push(instruction);
            } else {
                state.lastCopyLayer = instruction.layer;
            }
       }

       // Seems like the problem can be attacked from multiple angles
       // - COPY . . is always a mistake, but maybe we have to start from NPM installs and then go back reversed? See if we can find the package.lock?
       
       function handleRun(instruction: ding.nodeType.DockerRun): void{
            /**
             * We are solving this for the simplest case. In which the entire context and no package.json is present.
             */
            let statements: ding.nodeType.BashCommand[] = [];

            instruction.traverseDF(node => {
                if(node instanceof ding.nodeType.BashCommand){
                    statements.push(node);
                }
            });

            statements.forEach(statement => {
                let stmt: string[] = statement.toString()
                    .replace(/\r?\n/g, " ")
                    .replace(/\\/g, " ")
                    .split(" ")
                    .filter(w => w != "")
                    .filter(w => w != "sudo")
                    .filter(w => !w.startsWith("-"))
                    .filter(w => w != "RUN");

                if(stmt.length == 2 && stmt[0] == "npm" && stmt[1] == "install"){
                    console.log("WE ARE RESOLVING NPM STUFF");
                    console.log("PRINTING STATE:");
                    console.log(state);
                    console.log("it appears we need the file from the previous phase.")
                }
            })

            return;
        

            let runInstruction: string[] = instruction.toString()
                .replace(/\r?\n/g, " ")
                .replace(/\\/g, " ")
                .split(" ")
                .filter(w => w != "")
                .filter(w => w != "sudo")
                .filter(w => !w.startsWith("-"))
                .filter(w => w != "RUN");
            
            if(runInstruction.includes("npm")){
                console.log(runInstruction);
            }
            if(runInstruction.includes("npm") && runInstruction.includes("install") && state.hasCopiedEntireContext){
                //console.log(runInstruction);

                relevantInstructions.push(instruction);
                state.installCommand = instruction;

                fixInfo.list.push({
                    isManagerRelated: false,
                    code: "DL9020",
                    manager: null,
                    node: instruction.parent,
                    context: relevantInstructions
                });
                state.installLayer = instruction.layer;
                fileReport += "\tVOILATION DETECTED: No layer optimization by copying entire context for npm (DL9020)\n";
                set.add("DL9020"); //
            }
       }


       let state = {hasCopiedEntireContext: false, hasCopiedEntireContextLayer: -1, hasCopiedEntireContextCommand: null, lastCopyLayer: -1, installLayer: -1, installCommand: null};
       let relevantInstructions: ding.nodeType.DockerOpsNodeType[] = [];

       ast.children.forEach(dockerInstruction => {
           // Handling each instruction seperately ensures we handle one layer at a time, temporary or final doesn't matter.
           // Do we need an internal model of the file structure?
           handleInstruction(dockerInstruction);
       });
   }
}