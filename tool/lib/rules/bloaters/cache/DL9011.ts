import { Rule } from "../../../models/rule"

export default {
    code: "DL9011",
    message: "Clean cache for apt-get",
    detection: {
        manager: "apt-get",
        type: "CLEAN-CACHE"
    }
} as Rule