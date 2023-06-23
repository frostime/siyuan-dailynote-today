import fs from 'fs'

/**
 * 图片链接
 */
async function replace(readmePath, prefix) {
    const readme = await fs.promises.readFile(readmePath, 'utf-8')
    //![](asset/img.png)
    let imgPat = /!\[.*?\]\(\.?\/?(.*?)\)/g
    let imgurl = `${prefix}/$1`
    let newReadme = readme.replace(imgPat, `![](${imgurl})`);
    await fs.promises.writeFile(readmePath, newReadme)
}

/**
 * 读取 dist 目录下的所有md文件，替换图片链接
 */
async function main(prefix) {
    //iterate all md file in ./dist
    let prefixDirs = ['./dist', './dist/i18n'];
    let filePaths = [];
    for (const prefixDir of prefixDirs) {
        const files = await fs.promises.readdir(prefixDir);
        filePaths.push(...files.map(file => `${prefixDir}/${file}`));
    }

    for (const file of filePaths) {
        if (file.endsWith('.md')) {
            console.log(`Replacing ${file}`)
            await replace(file, prefix);
        }
    }
}

const imgbedPrefix = 'https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main';

main(imgbedPrefix)
