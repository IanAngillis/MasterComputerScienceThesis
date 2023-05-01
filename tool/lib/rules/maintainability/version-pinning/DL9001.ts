import { Rule } from "../../../models/rule"

export default {
    code: "DL9001",
    message: "Pin versions using apt install",
    detection: {
        manager: "apt",
        type: "VERSION-PINNING"
    }
} as Rule