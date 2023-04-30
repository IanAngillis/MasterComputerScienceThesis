import * as fs from 'fs';

function main(){
    // Folder which holds the data - should expand to folders eventually
    let path = "./data/dataset_dockerfile.pb";

    const data = fs.readFileSync(path, 'utf-8');
    console.log(data.length);

    // let folder = "./../data/dockerfiles/";
    // let testFolder = "./../data/testfiles/";
    // let binnacle = "./../data/binnacle/github/deduplicated-sources/";
    // let crashed = "./../data/chrashedfiles/";

    // // Variable that sets folder for program
    // let currentFolder = folder;

    // const dir = await fs.promises.opendir(currentFolder);

    // for await (const dirent of dir){
    //     const data = fs.readFileSync(fs.join(folder, dirent), 'utf-8');
    //     const contents = data.split(/\r?\n/).filter(w => w != "");

    //     contents.forEach(line => {
    //         let rule: string = line.split(" ")[1];
            
    //         console.log(rule);
    //     });
    
    // }
}

main();