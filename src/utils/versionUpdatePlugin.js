import fs from 'fs';
import path from 'path';

const writeVersion = (versionFileName, content) => {
  // 写入文件
  fs.writeFile(versionFileName, content, err => {
    if (err) throw err;
  });
};
export default options => {
  let config = {
    publicDir: 'build',
  };
  return {
    name: 'version-update',
    configResolved(resolvedConfig) {
      // 存储最终解析的配置
      config = resolvedConfig;
    },
    buildStart() {
      // 生成版本信息文件路径
      const file = config.publicDir + path.sep + '/version.json';
      console.log('fi', file);
      // 这里使用编译时间作为版本信息
      const content = JSON.stringify({ version: options.version });
      if (fs.existsSync(config.publicDir)) {
        writeVersion(file, content);
      } else {
        fs.mkdir(config.publicDir, err => {
          if (err) throw err;
          writeVersion(file, content);
        });
      }
    },
  };
};
