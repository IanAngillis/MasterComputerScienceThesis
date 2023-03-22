import { Rule } from "../models/rule";
import {maintainabilityRules as MAINTAINABILITYRULES} from "./maintainability";
import {bloaterRules as BLOATERRULES} from "./bloaters";

export const allRules: Rule[] = MAINTAINABILITYRULES.concat(BLOATERRULES);