import { Rule } from "../../models/rule";
import {rules as VERSIONPINNINGRULES} from "./version-pinning";
import {interactionRules as INTERACTIONRULES} from "./interaction";


export const maintainabilityRules: Rule[] = VERSIONPINNINGRULES.concat(INTERACTIONRULES);