# Siyuan Sample Plugin

This is a sample plugin of siyuan plugin system.

## Install

Clone the project to your computer. Use `pnpm install` to install the dependencies. Pnpm is mordern node module manager. You can learn it from [Pnpm website](https://pnpm.io/).

Then you can find the entry of plugin at `src/index.ts`, which export a default class. Plugins must export a default class which extended from `Plugin`. Plugin has `onload` and `onunload` lifecycle hook. Which will called when the plugin is loaded and unloaded.

## Build

Run `pnpm build` to generate the target `main.js` in dist/ folder. Copy it and the manifest.json and put them into plugins/\<pluginName\> folder in your Siyuan workspace, like `workspace/data/plugins/siyuan-plugin-sample`.

## Toolchain

+ Vite
+ Pnpm
+ Typescript: Strongly recommanded.

Feel free to install your own dependencies, like `vue`, `react`, `svelte` and so on.

## Manifest

You should write a manifest.json file to describe the plugin. It contains `name`, `version`, `description`, `author` and `url`.