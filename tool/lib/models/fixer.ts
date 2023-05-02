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
                    this.handleDockerRun(node);
                    //console.log(node.children[1].children[0].children[1]);
                    break;
            }
        });

        console.log(ast.toString());
        
        //console.log(this.createCommand("apt-get", ["clean", "-all"]).toString());
        //console.log(this.newFile);
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
        let num = 0;
        let bool: boolean = true;
        console.log("RUN**");
        run.traverseDF(node => {
            console.log(node.annotations);
            if(node.type == "BASH-COMMAND" && bool){
                if(num == 1){
                    let command = this.createCommand("apt-get", ["clean", "-all"]);
                    this.insertBinaryOpCommand(node, command, false);
                    bool = false;
                }
                num ++;
            }
        });
        console.log("****");
    }

    insertBinaryOpCommand(node: ding.nodeType.BashCommand, command: ding.nodeType.BashCommand, left: boolean): void{
        let bashConditionBinary: ding.nodeType.BashConditionBinary = new ding.nodeType.BashConditionBinary();
        let bashConditionBinaryLhs: ding.nodeType.BashConditionBinaryLhs = new ding.nodeType.BashConditionBinaryLhs();
        let bashConditionBinaryOp: ding.nodeType.BashConditionBinaryOp = new ding.nodeType.BashConditionBinaryOp();
        let bashConditionBinaryRhs: ding.nodeType.BashConditionBinaryRhs = new ding.nodeType.BashConditionBinaryRhs();
        let bashOp: ding.nodeType.BashOp = new ding.nodeType.BashOp("10");

        //bashConditionBinary.replace(node);
        node.replace(bashConditionBinary);
        // parent.addChild(bashConditionBinary);

        bashConditionBinaryOp.addChild(bashOp);
        bashConditionBinary.addChild(bashConditionBinaryLhs);
        bashConditionBinary.addChild(bashConditionBinaryOp);
        bashConditionBinary.addChild(bashConditionBinaryRhs);

        //bashConditionBinary.parent = parent;

        //Command is to be inserted on the left of node.
        if(left){
            command.parent = bashConditionBinaryLhs;
            bashConditionBinaryLhs.addChild(command);

            node.parent = bashConditionBinaryRhs;
            bashConditionBinaryRhs.addChild(node);
        } else {
            node.parent = bashConditionBinaryLhs;
            bashConditionBinaryLhs.addChild(node);

            command.parent = bashConditionBinaryRhs;
            bashConditionBinaryRhs.addChild(command);
        }
       
        // console.log(node.parent.type);
        // if(node.parent.type == "BASH-CONDITION-BINARY-LHS"){
        //     console.log("in binary lhs");
        //     this.insertCommandInBinaryLHS(node, command, left);
        // } else if(node.parent.type = "BASH-CONDITION-BINARY-RHS"){
        //     console.log("in binary rsh");
        //     this.insertCommandInBinaryRHS(node, command, left);
        // } else {
        //     console.log("in non binary");
        //     this.insertCommandInNonBinaryOp(node, command, left);
        // }
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