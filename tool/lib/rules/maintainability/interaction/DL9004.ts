import { Rule } from "../../../models/rule"

export default {
    code: "DL9004",
    message: "Use the --no-input when using pip3 install",
    detection: {
        manager: "pip3",
        type: "NO-INTERACTION",
    }
} as Rule