export class PackageManager{
    command: string;
    packageVersionformatSplitter: string;
    preInstall: string;
    installOption: string;
    installOptionsFlags: [string];
    cleanCacheIsInstallFlag: boolean;
    cleanCacheOptions: string;
    afterInstall: string;
}