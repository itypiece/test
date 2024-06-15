import { exec } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const packageJsonPath = './lock/package.json';

const removeInvalidPackages = async () => {
  // 读取 package.json 文件
  const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  const allDependencies = { ...dependencies, ...devDependencies };
  const invalidPackages: string[] = [];

  // 检查每个依赖项是否可以安装
  const checkPackage = async (pkg: string, version: string) => {
    try {
      await execAsync(`npm view ${pkg}@${version} version`);
    } catch {
      invalidPackages.push(pkg);
    }
  };

  const checks = Object.entries(allDependencies).map(([pkg, version]) =>
    checkPackage(pkg, version)
  );

  await Promise.all(checks);

  if (invalidPackages.length > 0) {
    console.log('以下包不存在或无法安装，将被移除:', invalidPackages);

    // 从 package.json 中移除无效的包
    invalidPackages.forEach((pkg) => {
      delete packageJson.dependencies?.[pkg];
      delete packageJson.devDependencies?.[pkg];
    });

    // 写回 package.json 文件
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  } else {
    console.log('所有包都可以安装');
  }
};

removeInvalidPackages().catch((error) => {
  console.error('处理过程中发生错误:', error);
});
