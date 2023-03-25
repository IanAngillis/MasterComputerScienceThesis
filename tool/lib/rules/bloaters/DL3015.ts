import { Rule } from "../../models/rule"

export default {
    code: "DL3015",
    message: "Avoid additional packages by specifying --no-install-recommends using apt-get",
    detection: {
        manager: "apt-get",
        type: "NO-RECOMMENDS"
    }
} as Rule