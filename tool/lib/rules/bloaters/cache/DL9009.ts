import { Rule } from "../../../models/rule"

export default {
    code: "DL9009",
    message: "Use -no-cache-dir flag during pip3 install to avoid cache",
    detection: {
        manager: "pip3",
        type: "CLEAN-CACHE"
    }
} as Rule