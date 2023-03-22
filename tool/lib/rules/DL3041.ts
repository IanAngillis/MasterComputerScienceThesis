import { Rule } from "../models/rule"

export default {
    code: "DL3041",
    message: "Pin versions using dnf install",
    detection: {
        manager: "dnf",
        type: "VERSION-PINNING"
    }
} as Rule