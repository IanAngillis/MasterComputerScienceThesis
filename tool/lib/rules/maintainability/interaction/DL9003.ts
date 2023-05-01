import { Rule } from "../../../models/rule"

export default {
    code: "DL9003",
    message: "Use the -y when using apt install",
    detection: {
        manager: "apt",
        type: "NO-INTERACTION",
    }
} as Rule