"use strict";
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                  desc = {
                      enumerable: true,
                      get: function () {
                          return m[k];
                      },
                  };
              }
              Object.defineProperty(o, k2, desc);
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, "default", { enumerable: true, value: v });
          }
        : function (o, v) {
              o["default"] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    (function () {
        var ownKeys = function (o) {
            ownKeys =
                Object.getOwnPropertyNames ||
                function (o) {
                    var ar = [];
                    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
                    return ar;
                };
            return ownKeys(o);
        };
        return function (mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
            __setModuleDefault(result, mod);
            return result;
        };
    })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudScriptHttp = void 0;
const axios = __importStar(require("axios"));
class CloudScriptHttp {
    async get(url, config) {
        return await axios.default.get(url, config);
    }
    async delete(url, config) {
        return await axios.default.delete(url, config);
    }
    async head(url, config) {
        return await axios.default.head(url, config);
    }
    async options(url, config) {
        return await axios.default.options(url, config);
    }
    async post(url, data, config) {
        return await axios.default.post(url, data, config);
    }
    async put(url, data, config) {
        return await axios.default.put(url, data, config);
    }
    async patch(url, data, config) {
        return await axios.default.patch(url, data, config);
    }
}
exports.CloudScriptHttp = CloudScriptHttp;
