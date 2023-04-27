export class PackageManager{
    command: string;
    packageVersionFormatSplitter: string;
    preInstall: string[];
    installOption: string[];
    installOptionFlags: {value: string, type?: "NO-INTERACTION"| "VERSION-PINNING" | "CLEAN-CACHE" | "NO-RECOMMENDS", alternative?: string}[];
    cleanCacheIsInstallFlag: boolean;
    cleanCacheOption: string[];
    cleanCacheOptionFlags: string[];
    afterInstall: string[];
}