import { defineConfig } from "vite";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root=dirname(fileURLToPath(import.meta.url));
const source=resolve(root,"node_modules/cesium/Build/Cesium");
const target=resolve(root,"public/Cesium");
if(existsSync(source)){mkdirSync(target,{recursive:true});for(const dir of ["Workers","ThirdParty","Assets","Widgets"]){const from=resolve(source,dir);if(existsSync(from))cpSync(from,resolve(target,dir),{recursive:true,force:true});}}
export default defineConfig({define:{CESIUM_BASE_URL:JSON.stringify("/Cesium/")},build:{chunkSizeWarningLimit:1800}});
