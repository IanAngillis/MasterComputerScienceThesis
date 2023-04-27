import * as fs from 'fs';

async function main(){
    // Folder which holds the data - should expand to folders eventually
    let folder = "./../tool/rep/";
    let testFolder = "./../data/testfiles/";
    let binnacle = "./../data/binnacle/github/deduplicated-sources/";
    let crashed = "./../data/chrashedfiles/";

    // Variable that sets folder for program
    let currentFolder = folder;
    let smells: {rule: string, times: number}[] = [];
    let absoluteSmells: {rule: string, times: number}[] = [];

    let smellList: string[] = ["DL3008",
    "DL3014",
    "DL3009",
    "DL3015",
    "DL3018",
    "TD007",
    "DL3042",
    "TD004",
    "TD006",
    "TD001",
    "TF0003",
    "DL3016",
    "TD4007",
    "DL3033",
    "DL3032",
    "DL3036",
    "DL3013",
    "DL3060",
    "ADD/rm",
    "TF0004",
    "DL3019", 
    "TD003",
    "TD0001",
    "DL3041",
    "TD002",
    "COPY/rm",
    "DL3037",
    "DL3034",
    "TD0002",
    "DL3040",
    "DL0005",
    "DL3030"];


    const dir = await fs.promises.opendir(currentFolder);
    let mapped_hadolint_log : fs.WriteStream = fs.createWriteStream("./mapped-hadolint-smells.txt", {flags: 'a'});


    for await (const dirent of dir){
        const data = fs.readFileSync(folder + dirent.name, 'utf-8');
        const contents = data.split(/\r?\n/).filter(w => w != "");
        let set: Set<string> = new Set<string>();

        contents.forEach(line => {
            let rule: string = line.split(" ")[1];
            if(rule == undefined){
                console.log(dirent.name)
            }else{
                let idx: number = absoluteSmells.findIndex(s => s.rule == rule);

                if(idx == -1){
                    absoluteSmells.push({rule: rule, times: 1});
                } else {
                    absoluteSmells[idx].times += 1;
                }

                set.add(rule);
            } 
        })

        set.forEach(smell => {
            let idx: number = smells.findIndex(s => s.rule == smell);

            if(idx == - 1){
                smells.push({rule: smell, times: 1});
            } else {
                smells[idx].times += 1;
            }
        });

        mapped_hadolint_log.write(dirent.name + "," + Array.from(set).join(",") + "\n");
    }

    mapped_hadolint_log.close();

    console.log("relative");
    console.log(smells.filter(r => smellList.includes(r.rule)));
    console.log("absolute");
    console.log(absoluteSmells.filter(r => smellList.includes(r.rule)));
}

main();
