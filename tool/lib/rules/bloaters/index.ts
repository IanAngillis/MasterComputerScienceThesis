import { Rule } from "../../models/rule";
import { cacheRules as CACHERULES } from "./cache";
import DL9006 from "./DL9006";
import DL9007 from "./DL9007";
import DL3015 from "./DL3015";

const otherBloaterRules: Rule[] = [
    DL9006,
    DL9007,
    DL3015
]

export const bloaterRules: Rule[] = CACHERULES.concat(otherBloaterRules);