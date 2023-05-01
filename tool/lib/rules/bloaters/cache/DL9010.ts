import { Rule } from "../../../models/rule"

export default {
    code: "DL9010",
    message: "Use conda cache clean after conda install to prevent cache",
    detection: {
        manager: "conda",
        type: "CLEAN-CACHE"
    }
} as Rule