let containerPath: string = "/damn";
let path: string = "test/.."

if(path[0] == "/"){
    // Absolute path
    containerPath = path;
} else {
    // Relative path

    let containerPathParts: string[] = containerPath.split("/").filter(part => part != "");
    console.log(containerPathParts);
    let pathParts: string[] = path.split("/");


    pathParts.forEach(part => {
        switch(part){
            case ".":
                break;
            case "..":
                containerPathParts.splice(containerPathParts.length - 1);
                break;
            default:
                containerPathParts.push(part);
        }
    });

    containerPath = "/" + containerPathParts.join("/") + "/";
    console.log(containerPath);
}