function removeExtensions(str) {
    var substrings = str.split(".");
    for (var i = 0; i < substrings.length; i++) {
        if (substrings[i] == "tar") {
            substrings.splice(i);
            return substrings.join(".");
        }
    }
}
var teststring = "/go${GOVERSION}.linux-amd64.tar.gz";
console.log(removeExtensions(teststring));
