import { Rule } from "../../../models/rule"

export default {
    code: "DL3060",
    message: "Use yarn cache clean after yarn install to prevent cache",
    detection: {
        manager: "yarn",
        type: "CLEAN-CACHE"
    }
} as Rule