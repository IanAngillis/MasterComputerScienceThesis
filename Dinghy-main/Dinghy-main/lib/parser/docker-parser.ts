import {
  Add,
  Argument,
  Cmd,
  DockerfileParser,
  Entrypoint,
  From,
  JSONInstruction,
  Label,
  Line,
  Run,
  Shell,
  Volume,
  ModifiableInstruction,
  Copy,
} from "@tdurieux/dockerfile-ast";
import { existsSync } from "fs";
import File from "../file";
import { ShellParser } from "./docker-bash-parser";
import {
  DockerAdd,
  DockerAddSource,
  DockerAddTarget,
  DockerArg,
  DockerCmd,
  DockerCmdArg,
  DockerComment,
  DockerCopy,
  DockerCopySource,
  DockerCopyTarget,
  DockerEntrypoint,
  DockerEntrypointArg,
  DockerEntrypointExecutable,
  DockerEnv,
  DockerExpose,
  DockerFile,
  DockerFrom,
  DockerHealthCheck,
  DockerImageAlias,
  DockerImageDigest,
  DockerImageName,
  DockerImageRepo,
  DockerImageTag,
  DockerLiteral,
  DockerName,
  DockerKeyword,
  DockerOnBuild,
  DockerPath,
  DockerPort,
  DockerRun,
  DockerShell,
  DockerShellArg,
  DockerShellExecutable,
  DockerStopSignal,
  DockerUser,
  DockerVolume,
  DockerWorkdir,
  Position,
  Unknown,
  DockerLabel,
  DockerMaintainer,
  DockerFlag,
  DockerOpsNode,
  DockerOpsValueNode,
} from "../docker-type";

export class DockerParser {
  public readonly errors: Error[] = [];

  constructor(public readonly file: File) {}

  private rangeToPos(range: ReturnType<Line["getRange"]>) {
    if (!range) return undefined;
    const p = new Position(
      range.start.line,
      range.start.character,
      range.end.line,
      range.end.character
    );
    p.file = this.file;
    return p;
  }

  /**
   * It does something from the representation of the previous AST into the new one
   * @param instruction 
   * @param node 
   */
  private addFlag2Node(
    instruction: ModifiableInstruction,
    node: DockerOpsNode
  ) {
    instruction.getFlags().forEach((flag) => {
      node.addChild(
        new DockerFlag()
          .setPosition(this.rangeToPos(flag.getRange()))
          .addChild(
            new DockerName(flag.getName()).setPosition(
              this.rangeToPos(flag.getValueRange())
            )
          )
          .addChild(
            new DockerLiteral(flag.getValue()).setPosition(
              this.rangeToPos(flag.getValueRange())
            )
          )
      );
    });
  }

  async parse(): Promise<DockerFile> {
    
    // Keeping track of the logical layer
    var currentLayer = 0;

    // Keeping track of the path of the current working directory
    var currentAbsolutePath = "/";

    const dockerfileAST: DockerFile = new DockerFile();
    dockerfileAST.layer = currentLayer;

    if (!this.file || this.file.content?.trim().length == 0)
      return dockerfileAST;

    const lines = DockerfileParser.parse(this.file.content);

    if (!lines.getRange()) return dockerfileAST;
    const document = (lines as any).document;

    //The position encompasses the whole file.
    const p = new Position(
      0,
      0,
      document.lineCount - 1,
      this.file.content.split("\n").pop().length
    );

    p.file = this.file;
    dockerfileAST.setPosition(p);

    // Contains all the lines that have an instruction
    const instructionLines = new Set<number>();
 
    // For every instruction
    for (const line of lines.getInstructions()) {

      const position = this.rangeToPos(line.getRange());
      for (let line = position.lineStart; line <= position.lineEnd; line++) {
        instructionLines.add(line);
      }

      position.file = this.file;

      const command = line.getKeyword().toLowerCase();
      
      switch (command) {
        case "from":
          currentLayer += 1;
          const from = line as From;

          // This is the new node
          const fromNode = new DockerFrom().setPosition(position); 

          this.addFlag2Node(from, fromNode);

          fromNode.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );
          if (from.getRegistry()) {
            fromNode.addChild(
              new DockerImageRepo(from.getRegistry()).setPosition(
                this.rangeToPos(from.getRegistryRange())
              )
            );
          }
          if (from.getImageName()) {
            fromNode.addChild(
              new DockerImageName(from.getImageName()).setPosition(
                this.rangeToPos(from.getImageNameRange())
              )
            );
          }

          if (from.getImageTag()) {
            fromNode.addChild(
              new DockerImageTag(from.getImageTag()).setPosition(
                this.rangeToPos(from.getImageTagRange())
              )
            );
          }
          if (from.getImageDigest()) {
            fromNode.addChild(
              new DockerImageDigest(from.getImageDigest()).setPosition(
                this.rangeToPos(from.getImageDigestRange())
              )
            );
          }

          if (from.getBuildStage()) {
            fromNode.addChild(
              new DockerImageAlias(from.getBuildStage()).setPosition(
                this.rangeToPos(from.getBuildStageRange())
              )
            );
          }

          fromNode.layer = currentLayer;
          fromNode.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(fromNode);
          break;
        case "run":
          currentLayer += 1;
          const dockerRun = new DockerRun().setPosition(position);
          this.addFlag2Node(line as Run, dockerRun);

          dockerRun.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          dockerRun.layer = currentLayer;
          dockerRun.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(dockerRun);
          if (line.getRawArgumentsContent() == null) {
            break;
          }

          const shellString = line
            .getRawArgumentsContent()
            // required to consider that the comments are in the bash AST otherwise they will break lines and make the AST invalid
            .replace(/\r\n/gm, "\n")
            .replace(/#([^\\\n]*)$/gm, "#$1\\")
            // empty space after \
            .replace(/\\([ \t]+)\n/gm, "$1\\\n")
            // empty line
            .replace(/^([ \t]*)\n/gm, "$1\\\n");

          const shellParser = new ShellParser(
            shellString,
            this.rangeToPos(line.getArgumentsRange())
          );
          const shellNode = await shellParser.parse();

          shellNode.layer = currentLayer;
          shellNode.absolutePath = currentAbsolutePath;
          
          // Sets layer and absolutepath in every node of the parsed shell.
          shellNode.traverse((node) => {
            node.layer = currentLayer;
            node.absolutePath = currentAbsolutePath;
          });

          dockerRun.addChild(shellNode);
          // happen all errors
          shellParser.errors.forEach((v) => this.errors.push(v));

          break;
        case "copy":
          currentLayer += 1;

          const copy = new DockerCopy().setPosition(position);
          this.addFlag2Node(line as Copy, copy);

          copy.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          for (let i = 0; i < line.getArguments().length; i++) {
            const arg = line.getArguments()[i];
            let type: DockerCopyTarget | DockerCopySource;
            if (i === line.getArguments().length - 1) {
              //TODO -- update/keep path for target.
              type = new DockerCopyTarget();
            } else {
              type = new DockerCopySource();
            }
            type.addChild(
              new DockerPath(arg.getValue()).setPosition(
                this.rangeToPos(arg.getRange())
              )
            );
            copy.addChild(type);
          }

          copy.absolutePath = currentAbsolutePath;
          copy.layer = currentLayer;

          dockerfileAST.addChild(copy);
          break;
        case "add":
          currentLayer += 1;
          const add = new DockerAdd().setPosition(position);
          this.addFlag2Node(line as Add, add);

          add.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );
          
          for (let i = 0; i < line.getArguments().length; i++) {
            const arg = line.getArguments()[i];
            let type: DockerAddTarget | DockerAddSource;
            if (i === line.getArguments().length - 1) {
              type = new DockerAddTarget();
            } else {
              type = new DockerAddSource();
            }
            type.addChild(new DockerPath(arg.getValue()));
            add.addChild(type);
          }

          add.layer = currentLayer;
          add.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(add);
          break;
        case "expose":
          currentLayer += 1;
          const expose = new DockerExpose()
            .setPosition(position)
            .addChild(
              new DockerPort(line.getArgumentsContent()).setPosition(
                this.rangeToPos(line.getArgumentsRange())
              )
            );

          expose.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );
          
          expose.layer = currentLayer;
          expose.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(expose);
          break;
        case "workdir":
          currentLayer += 1;
          currentAbsolutePath = line.getArgumentsContent();
          const wkd = new DockerWorkdir().addChild(
            new DockerPath(line.getArgumentsContent()).setPosition(
              this.rangeToPos(line.getArgumentsRange())
            )
          );
          wkd.setPosition(position);

          wkd.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );
          
          wkd.layer = currentLayer;
          wkd.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(wkd);
          break;
        case "volume":
          currentLayer += 1;
          const volume = new DockerVolume().setPosition(position);
          this.addFlag2Node(line as Volume, volume);

          volume.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          for (const arg of line.getArguments()) {
            volume.addChild(new DockerPath(arg.toString()));
          }

          volume.layer = currentLayer;
          volume.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(volume);
          break;
        case "arg":
          currentLayer += 1;
          const arg = new DockerArg()
            .addChild(new DockerName(line.getArgumentsContent().split("=")[0]))
            .setPosition(position);

          arg.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          if (line.getArgumentsContent().includes("=")) {
            arg.addChild(
              new DockerLiteral(line.getArgumentsContent().split("=")[1].trim())
            );
          }

          arg.layer = currentLayer;
          arg.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(arg);
          break;
        case "env":
          currentLayer += 1;
          const args = line.getArguments();
          const env = new DockerEnv().setPosition(position);

          if (args.length > 0) {
            env.addChild(
              new DockerName(args[0].getValue()).setPosition(
                this.rangeToPos(args[0].getRange())
              )
            );
          }

          for (let i = 1; i < args.length; i++) {
            env.addChild(
              new DockerLiteral(args[i].getValue()).setPosition(
                this.rangeToPos(args[i].getRange())
              )
            );
          }

          env.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );
          
          env.layer = currentLayer;
          env.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(env);
          break;
        case "entrypoint":
          currentLayer += 1;
          let entrypointArgs: Argument[] = (
            line as JSONInstruction
          ).getJSONStrings();
          const entrypoint = new DockerEntrypoint().setPosition(position);
          this.addFlag2Node(line as Entrypoint, entrypoint);

          entrypoint.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          if (entrypointArgs.length == 0) entrypointArgs = line.getArguments();

          if (entrypointArgs.length > 0) {
            entrypoint.addChild(
              new DockerEntrypointExecutable(entrypointArgs[0].getValue())
            );

            for (let i = 1; i < entrypointArgs.length; i++) {
              entrypoint.addChild(
                new DockerEntrypointArg(entrypointArgs[i].getValue())
              );
            }
          }
          
          entrypoint.layer = currentLayer;
          entrypoint.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(entrypoint);
          break;
        case "cmd":
          currentLayer += 1;
          const cmd = new DockerCmd().setPosition(position);
          this.addFlag2Node(line as Cmd, cmd);

          cmd.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          // const cmdString = line
          //   .getRawArgumentsContent()
          //   // required to consider that the comments are in the bash AST otherwise they will break lines and make the AST invalid
          //   .replace(/\r\n/gm, "\n")
          //   .replace(/#([^\\\n]*)$/gm, "#$1\\")
          //   .replace(/\\ +\n/gm, "\\\n")
          //   .replace(/^( *)\n/gm, "$1\\\n");
          // const cmdParser = new ShellParser(
          //   cmdString,
          //   this.rangeToPos(line.getArgumentsRange())
          // );
          // const cmdNode = await cmdParser.parse();
          // cmd.addChild(cmdNode);

          let argus: Argument[] = (line as JSONInstruction).getJSONStrings();
          if (argus.length == 0) argus = line.getArguments();
          for (const arg of argus) {
            cmd.addChild(new DockerCmdArg(arg.getValue()));
          }

          //console.log((cmd.children[1] as DockerOpsValueNode).value);
          
          
          cmd.layer = currentLayer;
          cmd.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(cmd);
          break;
        case "shell":
          currentLayer += 1;
          const shell = new DockerShell().setPosition(position);
          this.addFlag2Node(line as Shell, shell);

          shell.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          argus = (line as Shell).getJSONStrings();
          if (argus.length == 0) argus = line.getArguments();
          shell.addChild(
            new DockerShellExecutable(argus[0].getValue()).setPosition(
              this.rangeToPos(argus[0].getRange())
            )
          );
          for (let index = 1; index < argus.length; index++) {
            const arg = argus[index];
            shell.addChild(
              new DockerShellArg(arg.getValue()).setPosition(
                this.rangeToPos(arg.getRange())
              )
            );
          }

          shell.layer = currentLayer;
          shell.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(shell);
          break;
        case "user":
          currentLayer += 1;
          const user = new DockerUser()
            .addChild(new DockerLiteral(line.getArgumentsContent()))
            .setPosition(position);

          user.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );
          
          user.layer = currentLayer;
          user.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(user);
          break;
        case "healthcheck":
          currentLayer += 1;
          const healthcheck = new DockerHealthCheck().setPosition(position);

          healthcheck.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          healthcheck.addChild(
            (await parseDocker(line.getRawArgumentsContent())).children[0]
          );


          healthcheck.layer = currentLayer;
          healthcheck.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(healthcheck);
          break;
        case "stopsignal":
          currentLayer += 1;
          const stopsignal = new DockerStopSignal()
            .setPosition(position)
            .addChild(new DockerLiteral(line.getArgumentsContent()));

          stopsignal.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );
          
          stopsignal.layer = currentLayer;
          stopsignal.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(stopsignal);
          break;
        case "onbuild":
          currentLayer += 1;
          const onbuild = new DockerOnBuild().setPosition(position);
          onbuild.addChild(
            (await parseDocker(line.getRawArgumentsContent())).children[0]
          );

          onbuild.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );

          onbuild.layer = currentLayer;
          onbuild.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(onbuild);
          break;
        case "label":
          currentLayer += 1;
          const labelArgs = (line as Label).getArguments();

          const dockerLabel = new DockerLabel().setPosition(position);

          if (labelArgs.length > 0) {
            dockerLabel.addChild(
              new DockerName(labelArgs[0].getValue()).setPosition(
                this.rangeToPos(labelArgs[0].getRange())
              )
            );
          }

          for (let i = 1; i < labelArgs.length; i++) {
            dockerLabel.addChild(
              new DockerLiteral(labelArgs[i].getValue()).setPosition(
                this.rangeToPos(labelArgs[i].getRange())
              )
            );
          }

          dockerLabel.addChild(
            new DockerKeyword(line.getInstruction()).setPosition(
              this.rangeToPos(line.getInstructionRange())
            )
          );
          
          dockerLabel.layer = currentLayer;
          dockerLabel.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(dockerLabel);
          break;
        case "maintainer":
          currentLayer += 1;
          const maintainer = new DockerMaintainer()
            .addChild(
              new DockerLiteral(line.getArgumentsContent()).setPosition(
                this.rangeToPos(line.getArgumentsRange())
              )
            )
            .setPosition(position)
            .addChild(
              new DockerKeyword(line.getInstruction()).setPosition(
                this.rangeToPos(line.getInstructionRange())
              )
            );
          
          maintainer.layer = currentLayer;
          maintainer.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(maintainer);
          break;
        default:
          currentLayer += 1;
          const e = new Error(`Unhandled Docker command: ${command}`);
          (e as any).node = line;
          this.errors.push(e);
          
          var unknownnode = new Unknown()
                            .setPosition(position)
                            .addChild(new DockerLiteral(command))
          
          unknownnode.layer = currentLayer;
          unknownnode.absolutePath = currentAbsolutePath;

          dockerfileAST.addChild(
            new Unknown()
              .setPosition(position)
              .addChild(new DockerLiteral(command))
          );
      }
    }

    // add comments if they are not inside an instruction
    for (const comment of lines.getComments()) {
      const position = new Position(
        comment.getRange().start.line,
        comment.getRange().start.character,
        comment.getRange().end.line,
        comment.getRange().end.character
      );
      position.file = this.file;
      // if not inside an instruction add to the root
      if (!instructionLines.has(comment.getRange().start.line)) {
        dockerfileAST.addChild(
          new DockerComment(comment.getContent()).setPosition(position)
        );
      }
    }

    // reset is changed when the model is built
    dockerfileAST.traverse((child) => {
      child.isChanged = false;
      return true;
    });
    return dockerfileAST;
  }
}

export async function parseDocker(file: string | File) {
  let parser: DockerParser = undefined;
  if (file instanceof File) {
    //console.log("intance of file");
    parser = new DockerParser(file);
  } else {
    if (existsSync(file)) {
      //console.log("Not an instance of file and path does exist");
      parser = new DockerParser(new File(file));
    } else {
      //console.log("Not an instance of file and path does not exist");
      parser = new DockerParser(new File(undefined, file));
    }
  }
  return parser.parse();
}
