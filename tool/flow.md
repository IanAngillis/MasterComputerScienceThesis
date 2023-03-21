File - allows us to read the content from a specific node.

parseDocker takes a file or a path
    Given a file, create a DockerParser with the file
    Given a path, create a File and use it to create a Dockerparser 
Then it parses:
    Creates Dockerfile AST with root node a Dockerfile node.





BashCommand - bashCommandCommand - bashWord - BashLiteral

BashCommand - BashCommandArgs

## BashScript
* BASH-CONDITION-BINARY
    * BASH-CONDITION-BINARY-LHS
    * BASH-CONDITION-BINARY-OP
    * BASH-CONDITION-BINARY-RHS
* BASH-COMMAND
    * BASH-COMMAND-COMMAND
        * BASH-WORD
            * BASH-LITERAL
    * BASH-COMMAND-ARGS
        * BASH-WORD
            * BASH-LITERAL

### Implications of the structure:
Given that whenever there is a binary operation, I can grep all the bash commands. I will know in which layer they are and they do not reference to any other LHS or RHS of a binary LHS. And if they are not part of a binary operation, then BashScript should be their parent.

We can use IsBefore to check if commands are before each other in a layer. Given that we know the layer - we know that they are happening at the same layer and thus we need not check for parents?