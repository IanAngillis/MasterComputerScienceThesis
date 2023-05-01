import { Rule } from "../../../models/rule"

export default {
    code: "DL9002",
    message: "Pin versions using pip3 install",
    detection: {
        manager: "pip3",
        type: "VERSION-PINNING"
    }
} as Rule