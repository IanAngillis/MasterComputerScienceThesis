import { Rule } from "../models/rule"

export default {
    code: "TD003",
    message: "Pin versions using apt install",
    detection: {
        manager: "apt",
        type: "VERSION-PINNING"
    }
} as Rule