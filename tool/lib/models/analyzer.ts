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
    temporaryFileAnalysis(ast:ding.nodeType.DockerFile){
        let args: {key:string, value:string, updatedInLayer?:number}[] = [];
        let envs: {key:string, value:string, updatedInLayer?:number}[] = [];
        let files: {absolutePath: string, file: string, extractedLayer?:number, introducedLayer?:number, deletedLayer?:number}[] = [];

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
            //console.log("Not implemented");
            //console.log("resolving ADD statement");
        }

        function resolveCopyStatement(copy: ding.nodeType.DockerCopy){
            //console.log("Not implemented");
            // Do the normal case where we copy individual files to a directory in target and save those
            // Keep track of files?
            //console.log(copy);
            //console.log("resolving COPY statement");
        }

        function resolveWget(wget: string[], layer: number, path: string){
            // Clear all the flags
            wget = wget.filter(w => !w.startsWith("-"));
            
            wget.forEach(arg => {
                let cleanArg: string = resolveArgsAndEnvsInString(arg).replace(/\"/g, "");

                if(cleanArg.startsWith("https") || cleanArg.startsWith("http")){
                    let splitArg: string[] = cleanArg.split("/");
                    let file: string = splitArg[splitArg.length - 1];
                    
                    files.push({
                        absolutePath: path + file,
                        file: file,
                        introducedLayer: layer,
                    })
                }
            });
        }

        
        function resolveCurl(curl: string[], layer: number, path: string){
            //console.log(curl);
        }

        function resolveTar(tar: string[], layer: number, path: string){
            // If no file is present - it may be so that the tar is piped to the curl or wget which writes to stdout. 
            tar = tar.filter(w => !w.startsWith("-")).filter(w => w != "tar");

            let matchFound: boolean = false;

            // Look for file
            tar.forEach(arg => {
                files.forEach(file => {
                    let resolvedFileName = resolveArgsAndEnvsInString(arg.replace(/\"/g, ""));
                    
                    if(resolvedFileName == file.file){
                        
                        file.extractedLayer = layer;
                        matchFound = true;
                    }
                });
            });

            if(matchFound){
                //console.log("match found - adjusting ...");
            }else{
                //console.log("No match found - check for piping?")
            }
        }


        function resolveRm(rm: string[], layer: number, path: string) {
            rm = rm.filter(w => !w.startsWith("-")).filter(w => w != "rm").map(w => w.replace(/\"/g, ""));

            let matchFound: boolean = false;

            rm.forEach(arg => {
                files.forEach(file => {
                    let resolvedFileName = resolveArgsAndEnvsInString(arg);

                    if(resolvedFileName == file.file){
                        file.deletedLayer = layer;
                        matchFound = true;
                    }
                });
            });

            if(matchFound){
                //console.log("Match found -- adjusting delete");
            } else {
                //console.log("No match found - check for piping?");
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
                        resolveWget(splitCommand, command.layer, command.absolutePath);
                        break;
                    case "tar":
                        resolveTar(splitCommand, command.layer, command.absolutePath);
                    case "curl":
                        resolveCurl(splitCommand, command.layer, command.absolutePath);
                        //console.log(splitCommand.filter(w => !w.startsWith("-")));
                        break;
                    case "rm":
                        resolveRm(splitCommand, command.layer, command.absolutePath);
                        //console.log(splitCommand.filter(w => !w.startsWith("-")));
                        break;
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
                    resolveCopyStatement(instruction as ding.nodeType.DockerCopy);
                    break;
                case'DOCKER-RUN':
                    resolveRunStatement(instruction as ding.nodeType.DockerRun);
                    break;
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



        function isURL(url: string): boolean {
            console.log("Checking");
            console.log(url);
            let cleanUrl : string = url.startsWith("") ? url.slice(1, url.length - 2) : url;
            console.log(cleanUrl);
            return cleanUrl.startsWith("https") || cleanUrl.startsWith("http");
        }

        /**
         * Procedure that dumps environmental information to the console
         */
        function infoDump(){
            console.log("******");
            console.log("This info dump contains all the information about the environment that is being kept on the Dockerfile");
            console.log("Args: ");
            console.log(args);
            console.log("Envs: ");
            console.log(envs);
            console.log("files: ");
            console.log(files);
            console.log("*****");
        }

        infoDump();
    }
    
}