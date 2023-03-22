import { Rule } from "../../../models/rule"

export default {
    code: "DL3009",
    message: "Delete the apt-get lists after installing something using apt-get",
    detection: {
        manager: "apt-get",
        type: "CLEAN-CACHE"
    }
} as Rule