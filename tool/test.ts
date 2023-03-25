let x = "pip3 install --no-cache-dir -q aiohttp pantomime\>=0.3.2 pyicu\>=2.0.6"

function splitWithoutEmptyString(text: string, delimiter: string): string[] {
    return text.replace(/\r?\n/g, delimiter).replace(/\\/g, delimiter).split(delimiter).filter(w => w != "");
}

console.log(splitWithoutEmptyString("pip3 install --no-cache-dir -q aiohttp pantomime>=0.3.2 pyicu>=2.0.6", " "));