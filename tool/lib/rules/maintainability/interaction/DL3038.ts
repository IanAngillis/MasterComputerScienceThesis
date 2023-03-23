import { Rule } from "../../../models/rule"

export default {
    code: "DL3038",
    message: "Use the -y when using dnf install",
    detection: {
        manager: "dnf",
        type: "NO-INTERACTION",
    }
} as Rule