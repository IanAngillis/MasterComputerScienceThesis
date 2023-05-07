import { AnyRecord } from 'dns';
import * as ding from './../../../Dinghy-main/Dinghy-main/build/index.js';
import { File } from './file.js';
import { DockerFile, DockerPath, DockerUser } from '../../../Dinghy-main/Dinghy-main/build/docker-type.js';
import * as fs from 'fs';


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
                        let clean: ding.nodeType.BashCommand;
                        let layer: number = fix.node.layer;

                        if(fix.manager.cleanCacheIsInstallFlag){
                            this.insertLiteralInCommand(fix.node, fix.manager.installOption[0], fix.managerinstallOptionFlags.find(f => f.type == "CLEAN-CACHE").value);
                        } else {
                            let args = [fix.manager.cleanCacheOption[0]];
                            fix.manager.cleanCacheOptionFlags.forEach(flag => {
                                args.push(flag.value);
                            });

                            clean = this.createCommand(fix.manager.command, args);
                            this.insertBinaryOpCommand(fix.node, clean, false);
                        }
                        
                        // We look for other smells in the fixlist that we do not handle directly.

                        if(fixInfo.list.findIndex(f => !f.isManagerRelated && f.code == "DL3009") != -1 && fix.manager.command == "apt-get" && fix.node.layer == layer){
                            let cmd: string = fix.manager.afterInstall[0];
                            let args: string[] = [];

                            for(let i: number = 1; i < fix.manager.afterInstall.length; i++){
                                args.push(fix.manager.afterInstall[i]);
                            }

                            this.insertBinaryOpCommand(
                                clean,
                                this.createCommand(cmd, args),
                                false
                            );
                        }

                        if(fixInfo.list.findIndex(f => !f.isManagerRelated && f.code == "DL9021") != -1 && fix.manager.command == "apt" && fix.node.layer == layer){
                            let cmd: string = fix.manager.afterInstall[0];
                            let args: string[] = [];

                            for(let i: number = 1; i < fix.manager.afterInstall.length; i++){
                                args.push(fix.manager.afterInstall[i]);
                            }

                            this.insertBinaryOpCommand(
                                clean,
                                this.createCommand(cmd, args),
                                false
                            );
                        }
                        

                        break;
                    case "NO-RECOMMENDS":
                        this.insertLiteralInCommand(fix.node, fix.manager.installOption[0], fix.manager.installOptionFlags.find(f => f.type == "NO-RECOMMENDS").value);
                        break;
                }
            } else {
                switch(fix.code){
                    case "DL3009":
                        break;
                    case "DL9021":
                        break;
                    case "DL3059":
                        this.consolidateRunInstruction(fix.context);
                        break;
                    case "TD0001":
                        console.log("\n\n");
                        this.handlingUnoptimizedCache(fix);
                        console.log("\n\n");
                        break;
                }
            }
        });

        fs.writeFileSync("./../data/repaired/" + "test" + ".Dockerfile", fixInfo.root.toString(true));

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

    handlingUnoptimizedCache(fix: any){
        let file: File = fix.context.file as File;
        let instr: ding.nodeType.DockerCopy = file.introducedStatement as ding.nodeType.DockerCopy;

        let source: ding.nodeType.DockerCopySource = instr.getChild(ding.nodeType.DockerCopySource);
        let target: ding.nodeType.DockerCopyTarget = instr.getChild(ding.nodeType.DockerCopyTarget);

        // source was .
        if(source.toString() == "."){
            let copyInstruction: ding.nodeType.DockerCopy = new ding.nodeType.DockerCopy();

            let dockerKeyword: ding.nodeType.DockerKeyword = new ding.nodeType.DockerKeyword("COPY");

            let dockerCopySource: ding.nodeType.DockerCopySource = new ding.nodeType.DockerCopySource();
            dockerCopySource.addChild(new ding.nodeType.DockerPath("package.json"));

            let dockerCopyTarget: ding.nodeType.DockerCopyTarget = new ding.nodeType.DockerCopyTarget();
            dockerCopyTarget.addChild(new ding.nodeType.DockerPath(target.getChild(ding.nodeType.DockerPath).value));

            copyInstruction.addChild(dockerKeyword);
            copyInstruction.addChild(dockerCopySource);
            copyInstruction.addChild(dockerCopyTarget);

            let dockerRun: ding.nodeType.DockerRun = new ding.nodeType.DockerRun();
            let dockerRunKeyword: ding.nodeType.DockerKeyword = new ding.nodeType.DockerKeyword("RUN");
            let bashScript:ding.nodeType.BashScript = new ding.nodeType.BashScript();

            bashScript.addChild(this.insertBinaryOpCommand(this.createCommand("npm", ["install"]), this.createCommand("npm", ["cache"]), false));

            dockerRun.addChild(dockerRunKeyword);
            dockerRun.addChild(bashScript);

            let dockerComment: ding.nodeType.DockerComment = new ding.nodeType.DockerComment("Fix for low-churn");

            console.log(copyInstruction.toString());
            console.log(dockerRun.toString());

            //Statements are ok, they need to be added to the Dockerfile

            let dockerFile: ding.nodeType.DockerFile = instr.parent as DockerFile;
            let idx: number = dockerFile.children.findIndex(i => i.layer == instr.layer);

            if(idx == -1){
                console.log("Index not found ??");
                return;
            } 

            // This messes up the layers - so this change could be done as the last change. 
            // Or needs a system that can update the layers, if a node is given to the fixlist than the layer should update in the source
            dockerFile.children.splice(idx, 0, dockerRun);
            dockerFile.children.splice(idx, 0, copyInstruction);
            //dockerFile.children.splice(idx, 0, dockerComment);

            dockerFile.isChanged = true;

            this.removeCommand(fix.context.runstatement);
        }
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

    insertBinaryOpCommand(node: ding.nodeType.BashCommand, command: ding.nodeType.BashCommand, left: boolean): ding.nodeType.BashConditionBinary{
        let bashConditionBinary: ding.nodeType.BashConditionBinary = new ding.nodeType.BashConditionBinary();
        let bashConditionBinaryLhs: ding.nodeType.BashConditionBinaryLhs = new ding.nodeType.BashConditionBinaryLhs();
        let bashConditionBinaryOp: ding.nodeType.BashConditionBinaryOp = new ding.nodeType.BashConditionBinaryOp();
        let bashConditionBinaryRhs: ding.nodeType.BashConditionBinaryRhs = new ding.nodeType.BashConditionBinaryRhs();
        let bashOp: ding.nodeType.BashOp = new ding.nodeType.BashOp("10");

        //bashConditionBinary.replace(node);
        if(node.parent != undefined){
            console.log("node did have a parent");
            node.replace(bashConditionBinary);
        }
        
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
        return bashConditionBinary;
    }

    removeCommand(node: ding.nodeType.BashCommand): void{
        switch(node.parent.type){
            case "BASH-SCRIPT":
                // Difference between single child or not
                if(node.parent.children.length == 1){
                    node.remove();
                } else {
                    console.log("not implemented");
                }
                
                break;
            case "BASH-CONDITION-BINARY-LHS":
                let rhs: ding.nodeType.BashConditionBinaryRhs = node.parent.parent.getChild(ding.nodeType.BashConditionBinaryRhs);
                
                // Difference between single child or not
                if(rhs.children.length == 1){
                    node.parent.parent.replace(rhs.children[0]);
                } else {
                    console.log("not implemented");
                }
                // remove LHS and replace BinaryConditionLHS with RHS
                break;
            case "BASH-CONDITION-BINARY-RHS":
                let newParent: ding.nodeType.DockerOpsNodeType = node.parent.parent.parent;
                let lhs: ding.nodeType.BashConditionBinaryLhs = node.parent.parent.getChild(ding.nodeType.BashConditionBinaryLhs);

                if(lhs.children.length == 1){
                    node.parent.parent.replace(lhs.children[0]);
                } else {
                    console.log("not implemented");
                }
                // remove RHS and replace BinaryCondition RHS with LHS
                break;
            default:
                break;
        }
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
    // This needs to be put as the last thing to do in the thing because removing layers is indeed the last thing to do as it does remove layers
    // Need to check if the problem still persists maybe, imagine you have remove instruction that you need and was already replaced. Then this becomes invalid. Maybe fixpoint needed indeed, or analysis done again at the end.
    // For now, we assume no problem
    consolidateRunInstruction(instructions: ding.nodeType.DockerRun[]): void{
        for(let i: number = 1; i < instructions.length; i++){
            this.insertBinaryOpCommand(
                instructions[i-1].getChild(ding.nodeType.BashScript).getChild(ding.nodeType.BashCommand), 
                instructions[i].getChild(ding.nodeType.BashScript).getChild(ding.nodeType.BashCommand), 
                false);
            
                instructions[i].remove();
        }
    }

    optimizeCache(){

        
    }
}