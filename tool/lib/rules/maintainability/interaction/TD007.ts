import { Rule } from "../../../models/rule"

export default {
    code: "TD007",
    message: "Use the --no-input when using pip install",
    detection: {
        manager: "pip",
        type: "NO-INTERACTION",
    }
} as Rule