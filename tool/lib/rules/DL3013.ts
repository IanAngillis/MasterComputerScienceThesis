import { Rule } from "../models/rule"

export default {
    code: "DL3013",
    message: "Pin versions using pip",
    detection: {
        manager: "pip",
        type: "VERSION-PINNING"
    }
} as Rule