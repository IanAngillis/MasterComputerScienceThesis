import { Rule } from "../../../models/rule"

export default {
    code: "DL3019",
    message: "Use the –no-cache switch",
    detection: {
        manager: "apk",
        type: "CLEAN-CACHE"
    }
} as Rule