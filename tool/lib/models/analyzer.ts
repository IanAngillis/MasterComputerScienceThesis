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
        let files: {absolutePath: string, extracted?:boolean, deleted?:boolean, introducedLayer?:number, deletedLayer?:number}[] = [];

        /**
         * Procedure that adds a docker ARG to the ARGS.
         * @param arg DockerArg
         */
        function addArgToArgs(arg: ding.nodeType.DockerArg){
            let key: string = (arg.getChild(ding.nodeType.DockerName) as ding.nodeType.DockerOpsValueNode).value;
            let value: string = (arg.getChild(ding.nodeType.DockerLiteral) as ding.nodeType.DockerOpsValueNode).value;
            
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
        function resolveArgsInString(str: string): string{
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

            // Keep iterating as replacements may introduce new args until no valid replacement is found
            if(stringUpdated){
                return resolveArgsInString(str);
            } else {    
                return str;
            } 
        }

        /**
         * Not implemented yet
         * @param env 
         */
        function addEvnToEnvs(env: ding.nodeType.DockerEnv){
            console.log("A not Implemented Log");
        }

        function resolveAddStatement(add: ding.nodeType.DockerAdd){
            //console.log("resolving ADD statement");
        }

        function resolveCopyStatement(copy: ding.nodeType.DockerCopy){
            console.log(copy);
            //console.log("resolving COPY statement");
        }

        function resolveRunStatement(run: ding.nodeType.DockerRun){
            //console.log("resolving RUN statement");
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
            console.log("*****");
        }

        //infoDump();
    }
    
}