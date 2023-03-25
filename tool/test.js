var x = "pip3 install --no-cache-dir -q aiohttp pantomime\>=0.3.2 pyicu\>=2.0.6";
function splitWithoutEmptyString(text, delimiter) {
    return text.replace(/\r?\n/g, delimiter).replace(/\\/g, delimiter).split(delimiter).filter(function (w) { return w != ""; });
}
console.log(splitWithoutEmptyString("pip3 install --no-cache-dir -q aiohttp pantomime>=0.3.2 pyicu>=2.0.6", " "));
