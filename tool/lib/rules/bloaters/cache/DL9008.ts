import { Rule } from "../../../models/rule"

export default {
    code: "DL9008",
    message: "Use npm cache clean after npm install to prevent cache",
    detection: {
        manager: "npm",
        type: "CLEAN-CACHE"
    }
} as Rule