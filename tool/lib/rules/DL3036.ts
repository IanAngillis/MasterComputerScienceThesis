import { Rule } from "../models/rule"

export default {
    code: "DL3036",
    message: "Use zypper clean to clean cache",
    detection: {
        manager: "yum",
        type: "CLEAN-CACHE"
    }
} as Rule