"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        while (_) try {
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ding = __importStar(require("./../../Dinghy-main/Dinghy-main/build/index.js"));
var fs = __importStar(require("fs"));
var managers_json_1 = __importDefault(require("./json/managers.json"));
var tool_types_1 = require("./models/tool-types");
var rules_1 = require("./rules");
var delimiter = " ";
function splitWithoutEmptyString(text, delimiter) {
    return text.replace(/\r?\n/g, delimiter).replace(/\\/g, delimiter).split(delimiter).filter(function (w) { return w != ""; });
}
function loop(path) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var dir, dir_1, dir_1_1, dirent, e_1_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4, fs.promises.opendir(path)];
                case 1:
                    dir = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, 8, 13]);
                    dir_1 = __asyncValues(dir);
                    _b.label = 3;
                case 3: return [4, dir_1.next()];
                case 4:
                    if (!(dir_1_1 = _b.sent(), !dir_1_1.done)) return [3, 6];
                    dirent = dir_1_1.value;
                    console.log(dirent.name);
                    _b.label = 5;
                case 5: return [3, 3];
                case 6: return [3, 13];
                case 7:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3, 13];
                case 8:
                    _b.trys.push([8, , 11, 12]);
                    if (!(dir_1_1 && !dir_1_1.done && (_a = dir_1.return))) return [3, 10];
                    return [4, _a.call(dir_1)];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10: return [3, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7];
                case 12: return [7];
                case 13: return [2];
            }
        });
    });
}
function createLogName() {
    var date = new Date();
    var year = date.getUTCFullYear();
    var month = date.getUTCMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var seconds = date.getSeconds();
    return year.toString() + month.toString() + day.toString() + hour.toString() + minute.toString() + seconds.toString() + "logs.txt";
}
function bashManagerCommandBuilder(node, manager) {
    var bashManagerCommand = new tool_types_1.BashManagerCommand();
    bashManagerCommand.layer = node.layer;
    bashManagerCommand.absolutePath = node.absolutePath;
    bashManagerCommand.setPosition(node.position);
    bashManagerCommand.source = node;
    var commands = splitWithoutEmptyString(node.toString(true), delimiter);
    bashManagerCommand.versionSplitter = manager.packageVersionFormatSplitter;
    bashManagerCommand.command = manager.command;
    bashManagerCommand.option = commands.filter(function (w) { return !w.startsWith("-") && w != bashManagerCommand.command; })[0];
    bashManagerCommand.hasInstallOption = (bashManagerCommand.option == manager.installOption[0]);
    bashManagerCommand.flags = commands.filter(function (w) { return w.startsWith("-"); });
    bashManagerCommand.arguments = [];
    commands.filter(function (w) { return w != bashManagerCommand.command &&
        w != bashManagerCommand.option &&
        !w.startsWith("-"); })
        .forEach(function (w) {
        bashManagerCommand.arguments.push(w);
    });
    return bashManagerCommand;
}
function main() {
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function () {
        var log, packageManagers, folder, dir, _loop_1, dir_2, dir_2_1, e_2_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    log = fs.createWriteStream("./logs/" + createLogName(), { flags: 'a' });
                    packageManagers = [];
                    fs.readdir("./reports", function (err, files) {
                        if (err)
                            throw err;
                        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                            var file = files_1[_i];
                            fs.unlink("./reports/" + file, function (err) {
                                if (err)
                                    throw err;
                            });
                        }
                    });
                    folder = "./../data/dockerfiles/";
                    managers_json_1.default.forEach(function (pm) {
                        packageManagers.push(pm);
                    });
                    return [4, fs.promises.opendir(folder)];
                case 1:
                    dir = _b.sent();
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, 9, 14]);
                    _loop_1 = function () {
                        var dirent, fileReport, ast, nodes, bashManagerCommands, text;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    dirent = dir_2_1.value;
                                    fileReport = "Report for: " + dirent.name + "\n";
                                    return [4, ding.dockerfileParser.parseDocker(folder + dirent.name)];
                                case 1:
                                    ast = _c.sent();
                                    nodes = ast.find({ type: ding.nodeType.BashCommand });
                                    bashManagerCommands = [];
                                    nodes.forEach(function (node) {
                                        packageManagers.forEach(function (manager) {
                                            var foundNode = node.find({ type: ding.nodeType.BashLiteral, value: manager.command });
                                            if (foundNode.length > 0) {
                                                bashManagerCommands.push(bashManagerCommandBuilder(node, manager));
                                            }
                                        });
                                    });
                                    text = dirent.name + " has got " + bashManagerCommands.length + " package commands";
                                    log.write(text + "\n");
                                    rules_1.allRules.forEach(function (rule) {
                                        fileReport += "Checking rule " + rule.code + " -- " + rule.message + ":\n";
                                        var manager = packageManagers.find(function (pm) { return pm.command == rule.detection.manager; });
                                        switch (rule.detection.type) {
                                            case "VERSION-PINNING":
                                                if (manager == null) {
                                                    console.log("No such manager found");
                                                }
                                                else {
                                                    bashManagerCommands.filter(function (c) { return c.command == rule.detection.manager && c.option == manager.installOption[0]; }).forEach(function (c) {
                                                        var requiresVersionPinning = false;
                                                        c.arguments.forEach(function (arg) {
                                                            if (arg.search(manager.packageVersionFormatSplitter) == -1) {
                                                                log.write("VIOLATION DETECTED: -- CODE " + rule.code + ": " + arg + " -- no version specified in file\n");
                                                                fileReport += "\tVOILATION DETECTED: " + arg + " at position:" + c.position.toString() + " for " + manager.command + " command\n";
                                                                requiresVersionPinning = true;
                                                            }
                                                            else {
                                                            }
                                                        });
                                                    });
                                                }
                                                break;
                                            case "NO-INTERACTION":
                                                if (manager != null) {
                                                    var noninteractionflag_1 = manager.installOptionFlags.find(function (flag) { return flag.type == "NO-INTERACTION"; });
                                                    if (noninteractionflag_1 != undefined) {
                                                        bashManagerCommands.filter(function (c) { return c.command == rule.detection.manager && c.option == manager.installOption[0]; }).forEach(function (c) {
                                                            var nonInteractionFlagIsPresent = false;
                                                            c.flags.forEach(function (flag) {
                                                                if (flag == noninteractionflag_1.value) {
                                                                    nonInteractionFlagIsPresent = true;
                                                                }
                                                            });
                                                            if (!nonInteractionFlagIsPresent) {
                                                                fileReport += "\tVOILATION DETECTED: " + noninteractionflag_1.value + " flag missing at position:" + c.position.toString() + " for " + manager.command + " command\n";
                                                            }
                                                        });
                                                    }
                                                }
                                                break;
                                            case "CLEAN-CACHE":
                                                if (manager != null) {
                                                    if (manager.cleanCacheIsInstallFlag) {
                                                        var installFlag_1 = manager.installOptionFlags.find(function (flag) { return flag.type == "CLEAN-CACHE"; });
                                                        if (installFlag_1 != undefined) {
                                                            var found = false;
                                                            bashManagerCommands.filter(function (c) { return c.command == rule.detection.manager && c.option == manager.installOption[0]; }).forEach(function (c) {
                                                                if (c.flags.find(function (flag) { return flag == installFlag_1.value; }) != undefined) {
                                                                }
                                                                else {
                                                                    fileReport += "\tVOILATION DETECTED: " + installFlag_1.value + " flag missing at position:" + c.position.toString() + " for command " + c.command + "\n";
                                                                }
                                                            });
                                                        }
                                                    }
                                                    else {
                                                        bashManagerCommands.filter(function (c) { return c.command == rule.detection.manager && c.option == manager.installOption[0]; }).forEach(function (ic) {
                                                            var hasCleanCacheCommand = false;
                                                            bashManagerCommands.filter(function (cc) { return ic.layer == cc.layer && ic.command == cc.command && cc.option == manager.cleanCacheOption[0]; })
                                                                .forEach(function (x) {
                                                                if (ic.source.isBefore(x.source)) {
                                                                    hasCleanCacheCommand = true;
                                                                }
                                                            });
                                                            if (!hasCleanCacheCommand) {
                                                                fileReport += "\tVOILATION DETECTED: No cache clean command detected for " + manager.command + " command at " + ic.position.toString() + "\n";
                                                            }
                                                        });
                                                    }
                                                }
                                                break;
                                            case "NO-RECOMMENDS":
                                                if (manager != null) {
                                                    var norecommendsflag_1 = manager.installOptionFlags.find(function (flag) { return flag.type == "NO-RECOMMENDS"; });
                                                    if (norecommendsflag_1 != undefined) {
                                                        var found_1 = false;
                                                        bashManagerCommands.filter(function (c) { return c.command == rule.detection.manager && c.option == manager.installOption[0]; }).forEach(function (c) {
                                                            if (c.arguments.find(function (arg) { return arg == norecommendsflag_1.value; }) != undefined) {
                                                                found_1 = true;
                                                            }
                                                            else {
                                                                fileReport += "\tVOILATION DETECTED: No " + norecommendsflag_1.value + " flag detected for " + manager.command + " command at " + c.position.toString() + "\n";
                                                            }
                                                        });
                                                    }
                                                }
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                                    fs.writeFileSync("./reports/" + dirent.name + ".txt", fileReport);
                                    return [2];
                            }
                        });
                    };
                    dir_2 = __asyncValues(dir);
                    _b.label = 3;
                case 3: return [4, dir_2.next()];
                case 4:
                    if (!(dir_2_1 = _b.sent(), !dir_2_1.done)) return [3, 7];
                    return [5, _loop_1()];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [3, 3];
                case 7: return [3, 14];
                case 8:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3, 14];
                case 9:
                    _b.trys.push([9, , 12, 13]);
                    if (!(dir_2_1 && !dir_2_1.done && (_a = dir_2.return))) return [3, 11];
                    return [4, _a.call(dir_2)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11: return [3, 13];
                case 12:
                    if (e_2) throw e_2.error;
                    return [7];
                case 13: return [7];
                case 14:
                    log.close();
                    return [2];
            }
        });
    });
}
main();
//# sourceMappingURL=tool.js.map