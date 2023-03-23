import { Rule } from "../../../models/rule"

export default {
    code: "DL3030",
    message: "Use the -y when using yum install",
    detection: {
        manager: "yum",
        type: "NO-INTERACTION",
    }
} as Rule