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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
exports.__esModule = true;
var fs = require("fs");
function main() {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function () {
        var folder, testFolder, binnacle, crashed, currentFolder, smells, absoluteSmells, smellList, dir, mapped_hadolint_log, _loop_1, _d, dir_1, dir_1_1, e_1_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    folder = "./../tool/rep/";
                    testFolder = "./../data/testfiles/";
                    binnacle = "./../data/binnacle/github/deduplicated-sources/";
                    crashed = "./../data/chrashedfiles/";
                    currentFolder = folder;
                    smells = [];
                    absoluteSmells = [];
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
                        "ADD/rm",
                        "TF0004",
                        "DL3019",
                        "TD003",
                        "TD0001",
                        "DL3041",
                        "TD002",
                        "COPY/rm",
                        "DL3037",
                        "DL3034",
                        "TD0002",
                        "DL3040",
                        "DL0005",
                        "DL3030"];
                    return [4 /*yield*/, fs.promises.opendir(currentFolder)];
                case 1:
                    dir = _e.sent();
                    mapped_hadolint_log = fs.createWriteStream("./mapped-hadolint-smells.txt", { flags: 'a' });
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 7, 8, 13]);
                    _loop_1 = function () {
                        _c = dir_1_1.value;
                        _d = false;
                        try {
                            var dirent = _c;
                            var data = fs.readFileSync(folder + dirent.name, 'utf-8');
                            var contents = data.split(/\r?\n/).filter(function (w) { return w != ""; });
                            var set = new Set();
                            contents.forEach(function (line) {
                                var rule = line.split(" ")[1];
                                if (rule == undefined) {
                                    console.log(dirent.name);
                                }
                                else {
                                    var idx = absoluteSmells.findIndex(function (s) { return s.rule == rule; });
                                    if (idx == -1) {
                                        absoluteSmells.push({ rule: rule, times: 1 });
                                    }
                                    else {
                                        absoluteSmells[idx].times += 1;
                                    }
                                    set.add(rule);
                                }
                            });
                            set.forEach(function (smell) {
                                var idx = smells.findIndex(function (s) { return s.rule == smell; });
                                if (idx == -1) {
                                    smells.push({ rule: smell, times: 1 });
                                }
                                else {
                                    smells[idx].times += 1;
                                }
                            });
                            mapped_hadolint_log.write(dirent.name + "," + Array.from(set).join(",") + "\n");
                        }
                        finally {
                            _d = true;
                        }
                    };
                    _d = true, dir_1 = __asyncValues(dir);
                    _e.label = 3;
                case 3: return [4 /*yield*/, dir_1.next()];
                case 4:
                    if (!(dir_1_1 = _e.sent(), _a = dir_1_1.done, !_a)) return [3 /*break*/, 6];
                    _loop_1();
                    _e.label = 5;
                case 5: return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _e.trys.push([8, , 11, 12]);
                    if (!(!_d && !_a && (_b = dir_1["return"]))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _b.call(dir_1)];
                case 9:
                    _e.sent();
                    _e.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    mapped_hadolint_log.close();
                    console.log("relative");
                    console.log(smells.filter(function (r) { return smellList.includes(r.rule); }));
                    console.log("absolute");
                    console.log(absoluteSmells.filter(function (r) { return smellList.includes(r.rule); }));
                    return [2 /*return*/];
            }
        });
    });
}
main();
