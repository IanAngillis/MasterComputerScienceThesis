var containerPath = "/damn";
var path = "test/..";
if (path[0] == "/") {
    // Absolute path
    containerPath = path;
}
else {
    // Relative path
    var containerPathParts_1 = containerPath.split("/").filter(function (part) { return part != ""; });
    console.log(containerPathParts_1);
    var pathParts = path.split("/");
    pathParts.forEach(function (part) {
        switch (part) {
            case ".":
                break;
            case "..":
                containerPathParts_1.splice(containerPathParts_1.length - 1);
                break;
            default:
                containerPathParts_1.push(part);
        }
    });
    containerPath = "/" + containerPathParts_1.join("/") + "/";
    console.log(containerPath);
}
