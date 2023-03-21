import * as ding from './../../../Dinghy-main/Dinghy-main/build/index.js';

export class BashManagerCommand extends ding.nodeType.DockerOpsNode{
    //type - figure it out, perhaps a union is possible? No - because it needs to work with the type declared.
    command: string;
    option: string;
    flags: string[];
    arguments: BashManagerArgs[];
}

export class BashManagerArgs extends ding.nodeType.DockerOpsNode{
    arg: string;
}