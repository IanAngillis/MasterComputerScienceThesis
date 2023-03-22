import { Rule } from "../../../models/rule"

export default {
    code: "DL3016",
    message: "Pin versions in npm",
    detection: {
        manager: "npm",
        type: "VERSION-PINNING"
    }
} as Rule