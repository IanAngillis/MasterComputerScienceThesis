export class Logger{
    private logText: string;
    
    constructor(fileName: string){
        this.logText = "Report for: " + fileName + "\n";
    }

    log(smell: string): void{
        this.logText += smell;
        this.logText += "\n";
    }

    logViolation(violation: string): void{
        this.logText += "\t";
        this.logText += violation;
        this.logText += "\n";
    }

    logSmellSet(smellSet: string): void{
        this.logText += "RULE DETECTIONS: " + smellSet;
    }

    getLog(): string{
        return this.logText;
    }

    clearLog():void{
        this.logText = "";
    }
}