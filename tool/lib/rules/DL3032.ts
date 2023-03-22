import { Rule } from "../models/rule"

export default {
    code: "DL3032",
    message: "Use yum clean all to clean cache",
    detection: {
        manager: "yum",
        type: "CLEAN-CACHE"
    }
} as Rule