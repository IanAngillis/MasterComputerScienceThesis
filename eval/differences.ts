import * as fs from "fs";

async function main(){
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
    //"ADD/rm",
    "TF0004",
    "DL3019", 
    "TD003",
    "TD0001",
    "DL3041",
    "TD002",
    //"COPY/rm",
    "DL3037",
    "DL3034",
    "TD0002",
    "DL3040",
    "DL0005",
    "DL3030"];

    let mappedHadolintSmells: string = "./mapped-hadolint-smells.txt";
    let mappedToolSmells: string = "./mapped_tool_smells.txt";

    smellList.forEach(smell => {
        let hadolintMap: {file:string, hasSmell: boolean}[] = [];
        let toolMap: {file:string, hasSmell:boolean}[] = [];
        let detectedByHadolintAndNotTool: string[] = [];
        let detectedByToolAndNotHadolint: string[] = [];

        // Check hadolint
        const hadolintFileContent = fs.readFileSync(mappedHadolintSmells, 'utf-8');
        hadolintFileContent.split(/\r?\n/).forEach(line => {
            if(line.includes(smell)){
                hadolintMap.push({
                    file: line.split(",")[0],
                    hasSmell: true
                });
            } else {
                hadolintMap.push({
                    file: line.split(",")[0],
                    hasSmell: false
                });
            }
        });

        // Check tool
        const toolFileContent = fs.readFileSync(mappedToolSmells, 'utf-8');
        toolFileContent.split(/\r?\n/).forEach(line => {
            if(line.includes(smell)){
                toolMap.push({
                    file: line.split(",")[0],
                    hasSmell: true
                });
            } else {
                toolMap.push({
                    file: line.split(",")[0],
                    hasSmell: false
                });
            }
        });

        // Calculate difference
        if(toolMap.length != hadolintMap.length){
            console.log("Please check your files, they are not of equal length");
        }

        for(let i:number = 0; i < toolMap.length; i++){
            let hadolintEntry: {file: string, hasSmell: boolean} = hadolintMap[i];
            let toolEntry: {file: string, hasSmell: boolean} = toolMap[i];

            if(!(hadolintEntry.hasSmell && toolEntry.hasSmell)){
                if(hadolintEntry.hasSmell){
                    detectedByHadolintAndNotTool.push(hadolintEntry.file);
                }

                if(toolEntry.hasSmell){
                    detectedByToolAndNotHadolint.push(hadolintEntry.file);
                }
            }
        }

        let content: string = "Smell " + smell +"\n";
        content += "Detected by Hadolint and not tool: \n";
        content += Array.from(detectedByHadolintAndNotTool).join("\n");
        content += "\n";
        content += "Detected by Tool and not Hadolint: \n";
        content += Array.from(detectedByToolAndNotHadolint).join("\n");

        let toolCount: number = 0;
        let hadolintCount: number = 0;

        toolMap.forEach(map => {
            if(map.hasSmell){
                toolCount += 1;
            }
        });

        hadolintMap.forEach(map => {
            if(map.hasSmell){
                hadolintCount += 1;
            }
        });

        console.log("smell: " + smell);
        console.log("tool: " + toolCount);
        console.log("hadolint: " + hadolintCount);

        fs.writeFileSync("./differences/" + smell + ".txt", content);
    })
}

main();