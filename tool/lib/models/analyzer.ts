import * as ding from './../../../Dinghy-main/Dinghy-main/build/index.js';

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
    temporaryFileAnalysis(ast:ding.nodeType.DockerFile, fileReport: string, set: Set<string>){
        let args: {key:string, value:string, updatedInLayer?:number}[] = [];
        let envs: {key:string, value:string, updatedInLayer?:number}[] = [];
        let files: {absolutePath: string, file: string, extractedLayer?:number, introducedLayer?:number, deletedLayer?:number, isDirectory?:boolean, introducedBy: "COPY"|"ADD"|"BUILT-IN"}[] = [];
        let containerpath = "/";
        /**
         * Procedure that adds a docker ARG to the ARGS.
         * @param arg DockerArg
         */
        function addArgToArgs(arg: ding.nodeType.DockerArg){
            let key: string = (arg.getChild(ding.nodeType.DockerName) as ding.nodeType.DockerOpsValueNode).value;
            let value: string = (arg.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode) != undefined ? (arg.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode).value  : "";
            
            let idx = args.findIndex(x => x.key == key);

            if(idx != -1){
                args = args.splice(idx, 1);
            }

            args.push({
                key: key,
                value: value,
                updatedInLayer: arg.layer
            });
        }

        /**
         * Procedure that resolves possible ARGS in a string value.
         * @param str string potentionally containing ARGS
         * @returns string without ARGS
         */
        function resolveArgsAndEnvsInString(str: string): string{
            let stringUpdated: boolean = false;
            args.forEach(arg => {
                let substr: string = "${" + arg.key + "}";
                let idx: number = str.indexOf(substr);

                while(idx != -1){
                    str = str.replace(substr, arg.value);
                    idx = str.indexOf(substr);
                    stringUpdated = true;
                }
            });

            envs.forEach(env => {
                let substr: string = "$" + env.key;
                let idx: number = str.indexOf(substr);

                while(idx != -1){
                    str = str.replace(substr, env.value);
                    idx = str.indexOf(substr);
                    stringUpdated = true;
                }
            })

            // Keep iterating as replacements may introduce new args until no valid replacement is found
            if(stringUpdated){
                return resolveArgsAndEnvsInString(str);
            } else {    
                //console.log(str);
                return str;
            } 
        }

        /**
         * Procedure that adds ENVs to ENVS
         * @param env 
         */
        function addEvnToEnvs(env: ding.nodeType.DockerEnv){
            let key: string = (env.getChild(ding.nodeType.DockerName) as ding.nodeType.DockerOpsValueNode).value;
            let value: string = (env.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode) != undefined ? (env.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode).value  : "";

            if(key.indexOf("=") != -1 && value == ""){
                let keyValuePair: string[] = key.split("=");
                key = keyValuePair[0];
                value = keyValuePair[1];
            } else if (key.indexOf("=") != -1 && value != ""){
                let keyValuePair: string[] = (key + " " + value).split("=");
                key = keyValuePair[0];
                value = keyValuePair[1];
            }

            let idx = envs.findIndex(x => x.key == key);

            if(idx != -1){
                envs = envs.splice(idx, 1);
            }

            envs.push({
                key: key,
                value: value.replace(/\"/g, ""),
                updatedInLayer: env.layer
            });
        }

        function resolveAddStatement(add: ding.nodeType.DockerAdd){
            let sources: ding.nodeType.DockerAddSource[] = add.getChildren(ding.nodeType.DockerAddSource);
            let target: ding.nodeType.DockerAddTarget = add.getChild(ding.nodeType.DockerAddTarget);

            let finalPath: string = "";

            if(target.toString().startsWith("./") || target.toString().startsWith(".")){
                if(containerpath == "/"){
                    containerpath = "";
                }

                finalPath = containerpath + "/" + target.toString().slice(2);
            } else {
                finalPath = target.toString();
            }

            // Tinker with the target path as that is not right yet
            sources.forEach(source => {
                let file = source.toString();
                let isUrl = false;

                if(source.toString().startsWith("https") || source.toString().startsWith("http")){
                    isUrl = true;
                    console.log("hiiiiit");
                    let splitSource: string[] = source.toString().split("/");
                    file = splitSource[splitSource.length-1];
                }

                file = resolveArgsAndEnvsInString(file);

                if(!finalPath.includes(source.toString())){
                    finalPath += file;
                }

                files.push({
                    file: file,
                    absolutePath: finalPath,
                    introducedLayer: add.layer,
                    introducedBy: "ADD"
                });
            });
        }

        // Tinker with the target path as that one is not right yet. - Lot of duplicated code
        // Situation in ace64 where files are added by add statement and thus extracted and deleted in the same layer
        // Remote ADDs are NOT unpacked - therefore it is deleted later. Solution is to download to local context and then add it to directory, or to use WGET or CURL in the same layer.
        // Couple of recognized compressed tar bal extensions are recognized such that they are extracted - CHECK EXTENSIONS https://docs.docker.com/engine/reference/builder/#add
        function resolveCopyStatement(copy: ding.nodeType.DockerCopy){
            let sources: ding.nodeType.DockerCopySource[] = copy.getChildren(ding.nodeType.DockerCopySource);
            let target: ding.nodeType.DockerCopyTarget = copy.getChild(ding.nodeType.DockerCopyTarget);

            let finalPath: string = "";

            if(target.toString().startsWith("./") || target.toString().startsWith(".")){
                if(containerpath == "/"){
                    containerpath = "";
                }

                finalPath = containerpath + "/" + target.toString().slice(2);
            } else {
                finalPath = target.toString();
            }

            sources.forEach(source => {
                let file = source.toString();

                if(source.toString().startsWith("https") || source.toString().startsWith("http")){
                    let splitSource: string[] = source.toString().split("/");
                    file = splitSource[splitSource.length-1];
                }

                file = resolveArgsAndEnvsInString(file);

                if(!finalPath.includes(source.toString())){
                    finalPath += file;
                }

                files.push({
                    file: file,
                    absolutePath: finalPath,
                    introducedLayer: copy.layer,
                    introducedBy: "COPY"
                });
            });
        }

        function resolveWget(wget: string[], node: ding.nodeType.BashCommand){
            // Clear all the flags
            wget = wget.filter(w => !w.startsWith("-"));
            
            // Check for directory?
            wget.forEach(arg => {
                let cleanArg: string = resolveArgsAndEnvsInString(arg).replace(/\"/g, "");

                if(cleanArg.startsWith("https") || cleanArg.startsWith("http")){
                    let splitArg: string[] = cleanArg.split("/");
                    let file: string = splitArg[splitArg.length - 1];

                    if(containerpath == "/"){
                        containerpath = "";
                    }
                    
                    files.push({
                        absolutePath: containerpath + "/" + file,
                        file: file,
                        introducedLayer: node.layer,
                        introducedBy: "BUILT-IN"
                    });
                }
            });
        }

        
        function resolveCurl(curl: string[],  node: ding.nodeType.BashCommand){
            // Clear all the flags
            curl = curl.filter(w => !w.startsWith("-"));

            //Check for directory?
            curl.forEach(arg => {
                let cleanArg: string = resolveArgsAndEnvsInString(arg).replace(/\"/g, "");

                if(cleanArg.startsWith("https") || cleanArg.startsWith("http")){
                    let splitArg: string[] = cleanArg.split("/");
                    let file: string = splitArg[splitArg.length - 1];

                    if(containerpath == "/"){
                        containerpath = "";
                    }

                    files.push({
                        absolutePath: containerpath + "/" + file,
                        file: file, 
                        introducedLayer: node.layer,
                        introducedBy: "BUILT-IN"
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
                    
                    if(resolvedFileName == file.file){
                        file.extractedLayer = node.layer;
                        matchFound = true;
                    }
                });
            });

            if(matchFound){
                //console.log("match found - adjusting ...");
            }else{
                // Check for piping - current only checks back 1 statement.
                if(node.parent.parent != undefined && node.parent.parent.type == "BASH-CONDITION-BINARY"){
                    if(node.parent.parent.children[1].type == 'BASH-CONDITION-BINARY-OP'){
                        if(node.parent.parent.children[1].toString() == "|"){

                            let lastFile : {
                                absolutePath: string;
                                file: string;
                                extractedLayer?: number;
                                introducedLayer?: number;
                                deletedLayer?: number;
                            } = files[files.length - 1];

                            let command = node.parent.parent.children[0].toString().toString().replace(/\r?\n/g, " ").replace(/\\/g, " ").split(" ").filter(w => w != "").filter(w => w != "sudo").filter(w => !w.startsWith("-"));
                            command.forEach(arg => {
                                let resolvedFileName: string = resolveArgsAndEnvsInString(arg.replace(/\"/g, ""));

                                if(resolvedFileName.includes(lastFile.file)){
                                    lastFile.extractedLayer = node.layer;
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

                    if(resolvedFileName == file.file && file.absolutePath == containerpath  + "/" + resolvedFileName){
                        file.deletedLayer = node.layer;
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
                console.log("Handled absolute path");
            } else {
                // Relative path
                console.log("Handled relative path");
                let containerPathParts: string[] = containerpath.split("/").filter(part => part != "");
                console.log(containerPathParts);
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

        function resolveRunStatement(run: ding.nodeType.DockerRun){
            //Get all the commands - they are in sequential order and loop/branch insensitive
            let commands: ding.nodeType.BashCommand[] = run.find({type:ding.nodeType.BashCommand}) as ding.nodeType.BashCommand[];

            commands.forEach(command => {
                // we are under the assumption that the only word that could come before the actual command is sudo. Thus after removing sudo, we assume the first wordt to be the command
                let splitCommand: string[] = command.toString().replace(/\r?\n/g, " ").replace(/\\/g, " ").split(" ").filter(w => w != "").filter(w => w != "sudo");
                
                switch(splitCommand[0]){
                    case "wget":
                        resolveWget(splitCommand, command);
                        break;
                    case "tar":
                        resolveTar(splitCommand, command);
                    case "curl":
                        resolveCurl(splitCommand, command);
                        break;
                    case "rm":
                        resolveRm(splitCommand, command);
                        break;
                    case "cd":
                        resolveCd(splitCommand, command);
                    default:
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
                    addArgToArgs(instruction as ding.nodeType.DockerArg);
                    break;
                case 'DOCKER-ENV':
                    addEvnToEnvs(instruction as ding.nodeType.DockerEnv);
                    break;
                case 'DOCKER-ADD':
                    resolveAddStatement(instruction as ding.nodeType.DockerAdd);
                    break;
                case 'DOCKER-COPY':
                    console.log("\n" + instruction.toString() + "\n");
                    resolveCopyStatement(instruction as ding.nodeType.DockerCopy);
                    break;
                case'DOCKER-RUN':
                    resolveRunStatement(instruction as ding.nodeType.DockerRun);
                    break;
                case 'DOCKER-WORKDIR':
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

        files.forEach(file => {
            if(file.introducedLayer != undefined && file.deletedLayer != undefined){
                if(file.introducedLayer != file.deletedLayer){
                    console.log("TF FILE SMELL DETECTED");
                }
            }
        })

        function analyseResult(): void{
            files.forEach(file => {
                if(file.introducedLayer != undefined && file.deletedLayer != undefined && file.introducedLayer != file.deletedLayer){
                    switch(file.introducedBy){
                        case "ADD":
                            fileReport += "\tVOILATION DETECTED: ADD/rm temporary file smell for file" + file.file + "\n";
                            set.add("ADD/rm");
                            break;
                        case "COPY":
                            fileReport += "\tVOILATION DETECTED: COPY/rm temporary file smell for file" + file.file + "\n";
                            set.add("COPY/rm");
                            break;
                        case "BUILT-IN":
                            fileReport += "\tVOILATION DETECTED: BUILT-IN/rm temporary file smell for file" + file.file + "\n";
                            set.add("BUILT-IN/rm");
                            break;
                    }
                }else if (file.introducedLayer != undefined && file.extractedLayer != undefined && file.deletedLayer == undefined){
                    switch(file.introducedBy){
                        case "ADD":
                            fileReport += "\tVOILATION DETECTED: ADD introduced compressed file which was decompressed:" + file.file + "\n";
                            set.add("TF0001");
                            break;
                        case "COPY":
                            fileReport += "\tVOILATION DETECTED: COPY introduced compressed file which was decompressed:" + file.file + "\n";
                            set.add("TF0002");
                            break;
                        case "BUILT-IN":
                            fileReport += "\tVOILATION DETECTED: BUILT-IN introduced compressed file which was decompressed:" + file.file + "\n";
                            set.add("TF0003");
                            break;
                    }
                }
            });
        }

        /**
         * Procedure that dumps environmental information to the console
         */
        function infoDump(): void{
            // console.log("******");
            // console.log("This info dump contains all the information about the environment that is being kept on the Dockerfile");
            // console.log("Args: ");
            // console.log(args);
            // console.log("Envs: ");
            // console.log(envs);
            console.log("files: ");
            console.log(files);
            console.log("*****");
        }

        // Needs to be enabled to find smells
        analyseResult();
        infoDump();
    }
    
}