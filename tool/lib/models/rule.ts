export class Rule{
    code: string;
    message: string;
    detection: {
        manager?: string,
        type?: "NO-INTERACTION"| "VERSION-PINNING" | "CLEAN-CACHE" | "NO-RECOMMENDS",
    };
}