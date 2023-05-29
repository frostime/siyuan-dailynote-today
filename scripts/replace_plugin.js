import fs from 'fs';
import path from 'path';


//************************************ Write you dir here ************************************

//Please write the "workspace/data/plugins" directory here
//请在这里填写你的 "workspace/data/plugins" 目录
const targetDir = 'H:\\Media\\SiYuan\\data\\plugins';
//Like this
// const targetDir = `H:\\SiYuanDevSpace\\data\\plugins`;
//********************************************************************************************




//Check
if (!fs.existsSync(targetDir))
{
    console.log(`Failed! plugin directory not exists: "${targetDir}"`);
    console.log(`Please set the plugin directory in scripts/make_dev_link.js`);
    process.exit(1);
}


//check if plugin.json exists
if (!fs.existsSync('./plugin.json'))
{
    console.error('Failed! plugin.json not found');
    process.exit(1);
}

//load plugin.json
const plugin = JSON.parse(fs.readFileSync('./plugin.json', 'utf8'));
const name = plugin?.name;
if (!name || name === '')
{
    console.log('Failed! Please set plugin name in plugin.json');
    process.exit(1);
}

const distDir = `./dist`;
//mkdir if not exists
if (!fs.existsSync(distDir))
{
    fs.mkdirSync(distDir);
}

const targetPath = `${targetDir}/${name}`;
//如果已经存在，就重建目录
if (fs.existsSync(targetPath))
{
    console.log('目标文件已经存在, deleting...');
    fs.rmdirSync(targetPath, { recursive: true });
    fs.mkdirSync(targetPath);
}

const srcPath = `${process.cwd()}/dist`;

function copyFolderRecursiveSync(source, target)
{
    // 如果目标文件夹不存在则创建
    if (!fs.existsSync(target))
    {
        fs.mkdirSync(target);
    }

    // 读取源文件夹中的所有文件和子文件夹
    fs.readdirSync(source).forEach((file) =>
    {
        const sourceFilePath = path.join(source, file);
        const targetFilePath = path.join(target, file);

        // 如果是文件夹则递归拷贝
        if (fs.lstatSync(sourceFilePath).isDirectory())
        {
            copyFolderRecursiveSync(sourceFilePath, targetFilePath);
        } else
        {
            // 否则直接拷贝文件到目标文件夹
            fs.copyFileSync(sourceFilePath, targetFilePath);
        }
    });
}

copyFolderRecursiveSync(srcPath, targetPath);
console.log(`Done! Copied to ${targetPath}`);
