TODO:
* Figure out how to create a valid Dockefile from an AST - DONE
* Continue figuring out how the docker-ast-parser is converted to the better docker ast - TODO
* Finish the path such that it is properly propagated and different kind of path situation (using . instead of characters) are properly dealt with
* Conservative approach to layer - eventough some create an actual new layer and others are intermediate layers, we can still conservatively adhere to every instruction being a different layer