import { Rule } from "../../models/rule"

export default {
    code: "TD0001",
    message: "Avoid additional packages by specifying --no-install-recommends using apt",
    detection: {
        manager: "apt",
        type: "NO-RECOMMENDS"
    }
} as Rule