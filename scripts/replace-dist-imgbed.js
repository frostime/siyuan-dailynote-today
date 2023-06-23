const imgbedPrefix = 'https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main';

/**
 * 图片链接
 */
export async function replace(content, prefix=imgbedPrefix) {
    let imgPat = /!\[.*?\]\(\.?\/?(.*?)\)/g
    let imgurl = `${prefix}/$1`
    let newReadme = content.replace(imgPat, `![](${imgurl})`);
    // await fs.promises.writeFile(readmePath, newReadme)
    return newReadme;
}
