import { Rule } from "../models/rule"

export default {
    code: "TD4007",
    message: "Use npm cache clean after npm install to prevent cache",
    detection: {
        manager: "npm",
        type: "CLEAN-CACHE"
    }
} as Rule