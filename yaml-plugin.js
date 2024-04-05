/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-05 21:27:55
 * @FilePath     : /yaml-plugin.js
 * @LastEditTime : 2024-04-05 21:58:22
 * @Description  : 去妮玛的 json i18n，我就是要用 yaml
 */
// plugins/vite-plugin-parse-yaml.js
import fs from 'fs';
import yaml from 'js-yaml';
import { resolve } from 'path';

export default function vitePluginYamlI18n(options = {}) {
    // Default options with a fallback
    const DefaultOptions = {
        inDir: 'src/i18n',
        outDir: 'dist/i18n',
    };

    const finalOptions = { ...DefaultOptions, ...options };

    return {
        name: 'vite-plugin-yaml-i18n',
        buildStart() {
            console.log('🌈 解析 I18n: YAML to JSON..');
            const i18nPath = finalOptions.inDir;
            const outputPath = finalOptions.outDir

            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }

            const files = fs.readdirSync(i18nPath);
            for (const file of files) {
                if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                    console.log(`-- Parsing ${file}`)
                    //检查是否有同名的json文件
                    const jsonFile = file.replace(/\.(yaml|yml)$/, '.json');
                    if (files.includes(jsonFile)) {
                        console.log(`---- File ${jsonFile} already exists, skipping...`);
                        // continue;
                    }
                    try {
                        const filePath = resolve(i18nPath, file);
                        const fileContents = fs.readFileSync(filePath, 'utf8');
                        const parsed = yaml.load(fileContents);
                        const jsonContent = JSON.stringify(parsed, null, 2);
                        const outputFilePath = resolve(outputPath, file.replace(/\.(yaml|yml)$/, '.json'));
                        console.log(`---- Writing to ${outputFilePath}`);
                        fs.writeFileSync(outputFilePath, jsonContent);
                    } catch (error) {
                        this.error(`Error parsing YAML file ${file}: ${error.message}`);
                    }
                }
            }
        },
    };
}
