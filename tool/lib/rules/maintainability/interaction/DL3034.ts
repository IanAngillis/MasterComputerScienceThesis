import { Rule } from "../../../models/rule"

export default {
    code: "DL3034",
    message: "Use the -y when using zypper install",
    detection: {
        manager: "zypper",
        type: "NO-INTERACTION",
    }
} as Rule