import { Rule } from "../models/rule"

export default {
    code: "DL3033",
    message: "Pin versions using yum install",
    detection: {
        manager: "yum",
        type: "VERSION-PINNING"
    }
} as Rule