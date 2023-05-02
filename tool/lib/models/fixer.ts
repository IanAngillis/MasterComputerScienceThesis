import { AnyRecord } from 'dns';
import * as ding from './../../../Dinghy-main/Dinghy-main/build/index.js';

export class Fixer{
    newFile: string = "";

    constructor(){}
    
    convertAstToFile(ast: ding.nodeType.DockerFile){
        ast.children.forEach(node => {
            switch(node.type){
                case 'DOCKER-FROM':
                    //this.handleDockerFrom(node)
                    break;
                case 'DOCKER-RUN':
                    console.log(node.children[1].children[0].children[0]);
                    break;
            }
        });
        
        console.log(this.createCommand("apt-get", ["clean", "-all"]).toString());
        console.log(this.newFile);
    }

    handleDockerFrom(from: ding.nodeType.DockerFrom){
        let line: string = "";
        from.traverseDF(node => {
            if(node instanceof ding.nodeType.DockerOpsValueNode){
                line += node.value;
            }
        })

        line += "\r\n";
        this.newFile += line;
    }

    handleDockerRun(run: ding.nodeType.DockerRun){
        console.log("RUN**");
        run.traverseDF(node => {
            console.log(node.type);
            if(node.type == 'BASH-COMMAND'){

                // let idx = node.children.findIndex(c => c.find({type:ding.nodeType.BashCommandArgs, value: "install"}).length == 1);



                // console.log(node.toString());
                // // Fix for --no-install-recommends
                // let n = new ding.nodeType.BashCommandArgs();
                // let keyword = new ding.nodeType.BashWord();
                // let literal = new ding.nodeType.BashLiteral("--no-install-recommends");

                // // Fix for -y
                // //let n = new ding.nodeType.BashCommandArgs();
                // //let keyword = new ding.nodeType.BashWord();
                // //let literal = new ding.nodeType.BashLiteral("-y");

               
                console.log(node);
            }
        });
        console.log("****");
    }

    insertCommand(node: ding.nodeType.BashCommand, command: ding.nodeType.BashCommand){
        if(node.parent.type == 'BASH-CONDITION-BINARY-LHS'){
            console.log("left hand side binary");
        } else if(node.parent.type = 'BASH-CONDITION-BINARY-RHS'){
            console.log("right hand side binary");
        } else {
            console.log("no binary, make it so");
        }
    }

    

    insertLiteralInCommand(node: ding.nodeType.BashCommand, pivot: string, literal: string){
        let idx: number = node.children.findIndex(child => child.find({type:ding.nodeType.BashCommandArgs, value:pivot}));

        if(idx == -1){
            console.log("not found");
        } else {
            let bashLiteral: ding.nodeType.BashLiteral = new ding.nodeType.BashLiteral(literal);
            let bashWord: ding.nodeType.BashWord = new ding.nodeType.BashWord();
            let bashCommandArg: ding.nodeType.BashCommandArgs = new ding.nodeType.BashCommandArgs();
            
            bashWord.addChild(bashLiteral);
            bashCommandArg.addChild(bashWord);
            node.children.splice(idx + 1, 0, bashCommandArg);
        }
    }

    createCommand(command: string, args: string[]): ding.nodeType.BashCommand{
        let bashCommand: ding.nodeType.BashCommand = new ding.nodeType.BashCommand();
        
        //Create bashCommandCommand
        let bashCommandCommand: ding.nodeType.BashCommandCommand = new ding.nodeType.BashCommandCommand();
        let bashLiteral: ding.nodeType.BashLiteral = new ding.nodeType.BashLiteral(command);
        let bashWord: ding.nodeType.BashWord = new ding.nodeType.BashWord();
        
        bashWord.addChild(bashLiteral);
        bashCommandCommand.addChild(bashWord);
        bashCommand.addChild(bashCommandCommand);

        args.forEach(arg => {
            let bashCommandArg: ding.nodeType.BashCommandArgs = new ding.nodeType.BashCommandArgs();
            let bashLiteral: ding.nodeType.BashLiteral = new ding.nodeType.BashLiteral(arg);
            let bashWord: ding.nodeType.BashWord = new ding.nodeType.BashWord();

            bashWord.addChild(bashLiteral);
            bashCommandArg.addChild(bashWord);
            bashCommand.addChild(bashCommandArg);
        });

        return bashCommand;
    }
}