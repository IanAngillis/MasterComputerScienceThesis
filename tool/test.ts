function removeExtensions(str: string): string | undefined{
    let substrings: string[] = str.split(".");
    for(let i: number = 0; i < substrings.length; i++){
        if(substrings[i] == "tar"){
            substrings.splice(i);
            return substrings.join(".");
        }
    }
}


let teststring: string = "/go${GOVERSION}.linux-amd64.tar.gz";
console.log(removeExtensions(teststring));