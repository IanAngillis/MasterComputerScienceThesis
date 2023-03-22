import { Rule } from "../models/rule"

export default {
    code: "DL3008",
    message: "Pin versions using apt-get install",
    detection: {
        manager: "apt-get",
        type: "VERSION-PINNING"
    }
} as Rule