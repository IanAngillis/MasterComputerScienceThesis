"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var smellList, mappedHadolintSmells, mappedToolSmells;
        return __generator(this, function (_a) {
            smellList = ["DL3008",
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
            mappedHadolintSmells = "./mapped-hadolint-smells.txt";
            mappedToolSmells = "./mapped_tool_smells.txt";
            smellList.forEach(function (smell) {
                var hadolintMap = [];
                var toolMap = [];
                var detectedByHadolintAndNotTool = [];
                var detectedByToolAndNotHadolint = [];
                // Check hadolint
                var hadolintFileContent = fs.readFileSync(mappedHadolintSmells, 'utf-8');
                hadolintFileContent.split(/\r?\n/).forEach(function (line) {
                    if (line.includes(smell)) {
                        hadolintMap.push({
                            file: line.split(",")[0],
                            hasSmell: true
                        });
                    }
                    else {
                        hadolintMap.push({
                            file: line.split(",")[0],
                            hasSmell: false
                        });
                    }
                });
                // Check tool
                var toolFileContent = fs.readFileSync(mappedToolSmells, 'utf-8');
                toolFileContent.split(/\r?\n/).forEach(function (line) {
                    if (line.includes(smell)) {
                        toolMap.push({
                            file: line.split(",")[0],
                            hasSmell: true
                        });
                    }
                    else {
                        toolMap.push({
                            file: line.split(",")[0],
                            hasSmell: false
                        });
                    }
                });
                // Calculate difference
                if (toolMap.length != hadolintMap.length) {
                    console.log("Please check your files, they are not of equal length");
                }
                for (var i = 0; i < toolMap.length; i++) {
                    var hadolintEntry = hadolintMap[i];
                    var toolEntry = toolMap[i];
                    if (!(hadolintEntry.hasSmell && toolEntry.hasSmell)) {
                        if (hadolintEntry.hasSmell) {
                            detectedByHadolintAndNotTool.push(hadolintEntry.file);
                        }
                        if (toolEntry.hasSmell) {
                            detectedByToolAndNotHadolint.push(hadolintEntry.file);
                        }
                    }
                }
                var content = "Smell " + smell + "\n";
                content += "Detected by Hadolint and not tool: \n";
                content += Array.from(detectedByHadolintAndNotTool).join("\n");
                content += "\n";
                content += "Detected by Tool and not Hadolint: \n";
                content += Array.from(detectedByToolAndNotHadolint).join("\n");
                var toolCount = 0;
                var hadolintCount = 0;
                toolMap.forEach(function (map) {
                    if (map.hasSmell) {
                        toolCount += 1;
                    }
                });
                hadolintMap.forEach(function (map) {
                    if (map.hasSmell) {
                        hadolintCount += 1;
                    }
                });
                console.log("smell: " + smell);
                console.log("tool: " + toolCount);
                console.log("hadolint: " + hadolintCount);
                fs.writeFileSync("./differences/" + smell + ".txt", content);
            });
            return [2 /*return*/];
        });
    });
}
main();
