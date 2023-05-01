import { Rule } from "../../models/rule"

export default {
    code: "DL9007",
    message: "Avoid additional packages by specifying --no-recommends using zypper",
    detection: {
        manager: "zypper",
        type: "NO-RECOMMENDS"
    }
} as Rule