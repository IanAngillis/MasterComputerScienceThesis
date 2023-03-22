import { Rule } from "../../../models/rule"

export default {
    code: "DL3042",
    message: "Use -no-cache-dir flag during pip install to avoid cache",
    detection: {
        manager: "pip",
        type: "CLEAN-CACHE"
    }
} as Rule