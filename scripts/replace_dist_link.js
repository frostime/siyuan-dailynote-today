import fs from 'fs';


//************************************ Write you dir here ************************************

//Please write the "workspace/data/plugins" directory here
//请在这里填写你的 "workspace/data/plugins" 目录
const targetDir = 'H:\\Media\\SiYuan\\data\\plugins';
//Like this
// const targetDir = `H:\\SiYuanDevSpace\\data\\plugins`;
//********************************************************************************************




//Check
if (!fs.existsSync(targetDir)) {
    console.log(`Failed! plugin directory not exists: "${targetDir}"`);
    console.log(`Please set the plugin directory in scripts/make_dev_link.js`);
    process.exit(1);
}


//check if plugin.json exists
if (!fs.existsSync('./plugin.json')) {
    console.error('Failed! plugin.json not found');
    process.exit(1);
}

//load plugin.json
const plugin = JSON.parse(fs.readFileSync('./plugin.json', 'utf8'));
const name = plugin?.name;
if (!name || name === '') {
    console.log('Failed! Please set plugin name in plugin.json');
    process.exit(1);
}

const distDir = `./dist`;
//mkdir if not exists
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

const targetPath = `${targetDir}/${name}`;
//如果已经存在，就删除
if (fs.existsSync(targetPath)) {
    console.log('目标文件已经存在, deleting...');
    fs.rmdirSync(targetPath, { recursive: true });
}

//创建软链接
fs.symlinkSync(`${process.cwd()}/dist`, targetPath, 'junction');
console.log(`Done! Created symlink ${targetPath}`);
