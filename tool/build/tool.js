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
function splitWithoutEmptyString(text, delimiter) {
    return text.replace(/\r?\n/g, delimiter).split(delimiter).filter(function (w) { return w != ""; });
}
function loop(path) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var dir, _d, dir_1, dir_1_1, dirent, e_1_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4, fs.promises.opendir(path)];
                case 1:
                    dir = _e.sent();
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 7, 8, 13]);
                    _d = true, dir_1 = __asyncValues(dir);
                    _e.label = 3;
                case 3: return [4, dir_1.next()];
                case 4:
                    if (!(dir_1_1 = _e.sent(), _a = dir_1_1.done, !_a)) return [3, 6];
                    _c = dir_1_1.value;
                    _d = false;
                    try {
                        dirent = _c;
                        console.log(dirent.name);
                    }
                    finally {
                        _d = true;
                    }
                    _e.label = 5;
                case 5: return [3, 3];
                case 6: return [3, 13];
                case 7:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3, 13];
                case 8:
                    _e.trys.push([8, , 11, 12]);
                    if (!(!_d && !_a && (_b = dir_1.return))) return [3, 10];
                    return [4, _b.call(dir_1)];
                case 9:
                    _e.sent();
                    _e.label = 10;
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
function main() {
    var _a, e_2, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var packageManagers, delimiter, folder, dir, _loop_1, _d, dir_2, dir_2_1, e_2_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    packageManagers = [];
                    delimiter = " ";
                    folder = "./../data/dockerfiles/";
                    managers_json_1.default.forEach(function (pm) {
                        packageManagers.push(pm);
                    });
                    return [4, fs.promises.opendir(folder)];
                case 1:
                    dir = _e.sent();
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 8, 9, 14]);
                    _loop_1 = function () {
                        var dirent, ast, nodes, bashManagerCommands, text;
                        return __generator(this, function (_f) {
                            switch (_f.label) {
                                case 0:
                                    _c = dir_2_1.value;
                                    _d = false;
                                    _f.label = 1;
                                case 1:
                                    _f.trys.push([1, , 3, 4]);
                                    dirent = _c;
                                    return [4, ding.dockerfileParser.parseDocker(folder + dirent.name)];
                                case 2:
                                    ast = _f.sent();
                                    nodes = ast.find({ type: ding.nodeType.BashCommand });
                                    console.log(nodes.length + " BashCommands found");
                                    bashManagerCommands = [];
                                    nodes.forEach(function (node) {
                                        packageManagers.forEach(function (manager) {
                                            var foundNode = node.find({ type: ding.nodeType.BashLiteral, value: manager.command });
                                            if (foundNode.length > 0) {
                                                if (manager.command == "npm") {
                                                    console.log("found npm package");
                                                    return;
                                                }
                                                var bashManagerCommand_1 = new tool_types_1.BashManagerCommand();
                                                bashManagerCommand_1.layer = node.layer;
                                                bashManagerCommand_1.absolutePath = node.absolutePath;
                                                bashManagerCommand_1.setPosition(node.position);
                                                bashManagerCommand_1.source = node;
                                                var commands = splitWithoutEmptyString(node.toString(), delimiter);
                                                bashManagerCommand_1.versionSplitter = manager.packageVersionFormatSplitter;
                                                bashManagerCommand_1.command = manager.command;
                                                bashManagerCommand_1.option = commands.filter(function (w) { return !w.startsWith("-") && w != bashManagerCommand_1.command; })[0];
                                                bashManagerCommand_1.hasInstallOption = (bashManagerCommand_1.option == manager.installOption[0]);
                                                bashManagerCommand_1.flags = commands.filter(function (w) { return w.startsWith("-"); });
                                                bashManagerCommand_1.arguments = [];
                                                commands.filter(function (w) { return w != bashManagerCommand_1.command &&
                                                    w != bashManagerCommand_1.option &&
                                                    !w.startsWith("-"); })
                                                    .forEach(function (w) {
                                                    bashManagerCommand_1.arguments.push(w);
                                                });
                                                bashManagerCommands.push(bashManagerCommand_1);
                                            }
                                        });
                                    });
                                    text = dirent.name + " has got " + bashManagerCommands.length + " package commands";
                                    console.log(text);
                                    console.log(bashManagerCommands);
                                    return [3, 4];
                                case 3:
                                    _d = true;
                                    return [7];
                                case 4: return [2];
                            }
                        });
                    };
                    _d = true, dir_2 = __asyncValues(dir);
                    _e.label = 3;
                case 3: return [4, dir_2.next()];
                case 4:
                    if (!(dir_2_1 = _e.sent(), _a = dir_2_1.done, !_a)) return [3, 7];
                    return [5, _loop_1()];
                case 5:
                    _e.sent();
                    _e.label = 6;
                case 6: return [3, 3];
                case 7: return [3, 14];
                case 8:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3, 14];
                case 9:
                    _e.trys.push([9, , 12, 13]);
                    if (!(!_d && !_a && (_b = dir_2.return))) return [3, 11];
                    return [4, _b.call(dir_2)];
                case 10:
                    _e.sent();
                    _e.label = 11;
                case 11: return [3, 13];
                case 12:
                    if (e_2) throw e_2.error;
                    return [7];
                case 13: return [7];
                case 14: return [2];
            }
        });
    });
}
main();
//# sourceMappingURL=tool.js.map