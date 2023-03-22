import { Rule } from "../models/rule"

export default {
    code: "DL3018",
    message: "Pin versions using apk",
    detection: {
        manager: "apk",
        type: "VERSION-PINNING"
    }
} as Rule