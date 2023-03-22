import { Rule } from "../models/rule"

export default {
    code: "DL3040",
    message: "Use dnf clean all to clear cache",
    detection: {
        manager: "dnf",
        type: "CLEAN-CACHE"
    }
} as Rule