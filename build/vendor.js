import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// 获取 `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// **遍历 node_modules 目录**
function getNodeModulesPackages() {
  try {
    const nodeModulesPath = resolve(__dirname, './../node_modules');
    const packages = fs.readdirSync(nodeModulesPath);

    // 过滤 `.` 开头的隐藏文件，并处理 @scope 目录
    const filteredPackages = packages.flatMap(pkg => {
      if (pkg.startsWith('.')) return []; // 忽略隐藏目录，如 `.bin`
      if (pkg.startsWith('@')) {
        // 处理 @scope 作用域的包
        const scopePath = resolve(nodeModulesPath, pkg);
        return fs.readdirSync(scopePath).map(subPkg => `${pkg}/${subPkg}`);
      }
      return pkg;
    });

    return filteredPackages;
  } catch (error) {
    console.error('❌ 读取 node_modules 失败:', error);
    return {};
  }
}

// 根据环境生成不同的缓存文件名
function getCacheFilePath(mode) {
  return resolve(__dirname, `vendor-cache.${mode}.json`);
}

// **读取 JSON 文件**
function readCacheFile(mode) {
  try {
    const cacheFilePath = getCacheFilePath(mode);
    if (!fs.existsSync(cacheFilePath)) {
      console.warn('⚠️ 缓存文件不存在，将创建新的 JSON 文件。');
      return {}; // 返回空对象
    }
    const data = fs.readFileSync(cacheFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ 读取缓存文件失败:', error);
    return {}; // 返回空对象，防止程序崩溃
  }
}

// **存入新的 vendor 名称**
export function updateVendorCache(mode) {
  try {
    const cacheFilePath = getCacheFilePath(mode);
    const { VITE_APP_ENV } = loadEnv(mode, process.cwd());
    const installedNodeModules = getNodeModulesPackages(); // **获取所有包名**
    const cacheData = readCacheFile(mode); // 读取旧数据
    const isLocal = VITE_APP_ENV === 'localhost';
    if (isLocal) return cacheData.version || 1;
    // 缓存文件 不存在
    if (!cacheData.version) {
      cacheData.version = 1; // 更新 vendor 名称
      cacheData.nodeModules = installedNodeModules;
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf-8');
      // **写回 JSON 文件**
      console.log(`✅ 缓存文件已更新: ${cacheData.version}`);
      return cacheData.version;
    }
    // 缓存文件 存在
    if (installedNodeModules.length !== cacheData.nodeModules.length) {
      cacheData.version++;
      cacheData.nodeModules = installedNodeModules;
      fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf-8');
      return cacheData.version;
    }
    return cacheData.version;
  } catch (error) {
    console.error('❌ 写入缓存文件失败:', error);
  }
}
