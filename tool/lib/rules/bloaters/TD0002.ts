import { Rule } from "../../models/rule"

export default {
    code: "TD0002",
    message: "Avoid additional packages by specifying --no-recommends using zypper",
    detection: {
        manager: "zypper",
        type: "NO-RECOMMENDS"
    }
} as Rule