import { Rule } from "../models/rule"

export default {
    code: "DL3037",
    message: "Pin versions using zypper install",
    detection: {
        manager: "zypper",
        type: "VERSION-PINNING"
    }
} as Rule