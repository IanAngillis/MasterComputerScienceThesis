import { AnyRecord } from 'dns';
import * as ding from './../../../Dinghy-main/Dinghy-main/build/index.js';

export class Fixer{
    newFile: string = "";

    constructor(){}
    
    convertAstToFile(fixInfo: {root: ding.nodeType.DockerFile, list: any[]}){
        //Go through the fixlist and solve issues 1 by 1. For now there are no problems but it may need some sorting/priority system if fixes mess each other up. Worst case, we fix, analyse, fix cycle until fixpoint.
        // console.log("BEFORE**");
        // console.log(fixInfo.root.toString(true));
        // console.log("*********");
        fixInfo.list.forEach(fix => {
            //console.log(fix);
            if(fix.isManagerRelated){
                switch(fix.rule.detection.type){
                    case "NO-INTERACTION":
                        this.insertLiteralInCommand(fix.node, fix.manager.installOption[0], fix.manager.installOptionFlags.find(f => f.type == "NO-INTERACTION").value);
                        break;
                    case "CLEAN-CACHE":
                        if(fix.manager.cleanCacheIsInstallFlag){
                            this.insertLiteralInCommand(fix.node, fix.manager.installOption[0], fix.managerinstallOptionFlags.find(f => f.type == "CLEAN-CACHE").value);
                        } else {
                            let args = [fix.manager.cleanCacheOption[0]];
                            fix.manager.cleanCacheOptionFlags.forEach(flag => {
                                args.push(flag.value);
                            });

                            let command: ding.nodeType.BashCommand = this.createCommand(fix.manager.command, args);
                            this.insertBinaryOpCommand(fix.node, command, false);
                        }
                        break;
                    case "NO-RECOMMENDS":
                        this.insertLiteralInCommand(fix.node, fix.manager.installOption[0], fix.manager.installOptionFlags.find(f => f.type == "NO-RECOMMENDS").value);
                        break;
                }
            } else {
                switch(fix.code){
                    case "DL3009":
                        console.log("trying to fix");
                        break;
                    case "DL9021":
                        console.log("trying to fix");
                        break;
                    case "DL3059":
                        this.consolidateRunInstruction(fix.context);
                        break;

                }
            }
        });

        // console.log("AFTER***");
        // console.log(fixInfo.root.toString(true));
        // console.log("********");

        // ast.children.forEach(node => {
        //     switch(node.type){
        //         case 'DOCKER-FROM':
        //             //this.handleDockerFrom(node)
        //             break;
        //         case 'DOCKER-RUN':
        //             this.handleDockerRun(node);
        //             //console.log(node.children[1].children[0].children[1]);
        //             break;
        //     }
        // });

        // console.log(ast.toString());
        
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
        //console.log("RUN**");
        run.traverseDF(node => {
            //console.log(node.annotations);
            if(node.type == "BASH-COMMAND" && bool){
                if(num == 1){
                    let command = this.createCommand("apt-get", ["clean", "-all"]);
                    this.insertBinaryOpCommand(node, command, false);
                    bool = false;
                }
                num ++;
            }
        });
        //console.log("****");
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
        //console.log(node.children);
        let idx: number = node.children.findIndex(child =>  child.find({type:ding.nodeType.BashCommandArgs, value:pivot})[0] != undefined);
        console.log(idx);

        if(idx == -1){
            console.log("not found");
        } else {
            let bashLiteral: ding.nodeType.BashLiteral = new ding.nodeType.BashLiteral(literal);
            let bashWord: ding.nodeType.BashWord = new ding.nodeType.BashWord();
            let bashCommandArg: ding.nodeType.BashCommandArgs = new ding.nodeType.BashCommandArgs();

            bashLiteral.isChanged = true;
            bashWord.isChanged = true;
            bashCommandArg.isChanged = true;
            
            bashWord.addChild(bashLiteral);
            bashCommandArg.addChild(bashWord);
            node.children.splice(idx + 1, 0, bashCommandArg);

            if(bashLiteral.value == undefined){
                console.log("undefined");
            }
        }

        node.isChanged = true;
        // console.log("RESULT");
        // console.log(node.toString());
        // console.log("ENDRESULT");
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

    //Todo (like literally, it needs to be done)
    consolidateRunInstruction(instructions: ding.nodeType.DockerRun[]): void{
        instructions.forEach(instruction => {
            console.log(instruction.getChild(ding.nodeType.BashScript).children);
        })
    }

    optimizeCache(){
        
    }
}