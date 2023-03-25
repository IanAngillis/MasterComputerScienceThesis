import { Rule } from "../../models/rule";
import { cacheRules as CACHERULES } from "./cache";
import TD0001 from "./TD0001";
import TD0002 from "./TD0002";
import DL3015 from "./DL3015";

const otherBloaterRules: Rule[] = [
    TD0001,
    TD0002,
    DL3015
]

export const bloaterRules: Rule[] = CACHERULES.concat(otherBloaterRules);