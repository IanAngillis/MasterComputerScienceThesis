import { Rule } from "../../../models/rule"

export default {
    code: "DL9012",
    message: "Clean cache for apt",
    detection: {
        manager: "apt",
        type: "CLEAN-CACHE"
    }
} as Rule