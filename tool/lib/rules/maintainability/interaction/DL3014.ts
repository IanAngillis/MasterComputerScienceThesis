import { Rule } from "../../../models/rule"

export default {
    code: "DL3014",
    message: "Use the -y when using apt-get install",
    detection: {
        manager: "apt-get",
        type: "NO-INTERACTION",
    }
} as Rule