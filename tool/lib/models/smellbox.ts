/**
 * Class that represents a box that keeps track of smells throughout the analysis of the specified folder.
 */
export class SmellBox{
    private smellyFiles: {rule: string, times: number}[];
    private totalSmellsPresent: {rule: string, times: number}[];
    private smellsPerFile: {filename: string, time?: number, smells: {rule:string, times: number}[]}[];
    private current: string;
    private currentIndex: number;

    constructor(){
        this.smellyFiles = [];
        this.totalSmellsPresent = [];
        this.smellsPerFile = [];
    }

    getCurrent(): string{
        return this.current;
    }

    getSmellyFiles(): {rule: string, times: number}[]{
        return this.smellyFiles;
    }

    getTotalSmells(): {rule: string, times: number}[]{
        return this.totalSmellsPresent;
    }

    getSmellsPerFile(): {filename: string, smells: {rule:string, times: number}[]}[]{
        return this.smellsPerFile;
    }

    setTime(time: number){
        this.smellsPerFile[this.currentIndex].time = time;
    }

    setCurrent(filename: string){
        this.current = filename;

        let idx: number = this.smellsPerFile.findIndex(s => s.filename == this.current);

        if(idx == -1){
            this.smellsPerFile.push({
                filename: this.current, smells: []
            });

            this.currentIndex = this.smellsPerFile.length - 1;

        } else {
            this.currentIndex = idx;
        }
    }

    addSmellsPresentInFile(smellSet: string[]): void{
        smellSet.forEach(smell => {
            let idx: number = this.smellyFiles.findIndex(s => s.rule == smell);

            if(idx == -1){
                this.smellyFiles.push({rule: smell, times: 1});
            } else {
                this.smellyFiles[idx].times += 1;
            }
        });
    }

    addSmell(smell: string): void{
        // Update total amount
        let totalSmellsIdx: number = this.totalSmellsPresent.findIndex(s => s.rule == smell);

        if(totalSmellsIdx == -1){
            this.totalSmellsPresent.push({rule: smell, times: 1});
        } else {
            this.totalSmellsPresent[totalSmellsIdx].times += 1;
        }


        // Update per file basis
        let smellsPerFileIdx: number = this.smellsPerFile[this.currentIndex].smells.findIndex(s => s.rule == smell);

        if(smellsPerFileIdx == -1){
            this.smellsPerFile[this.currentIndex].smells.push({rule: smell, times: 1});
        } else {
            this.smellsPerFile[this.currentIndex].smells[smellsPerFileIdx].times += 1;
        }
    }
}