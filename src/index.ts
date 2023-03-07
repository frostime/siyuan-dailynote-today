import { Plugin, clientApi } from 'siyuan';

export default class SiyuanSamplePlugin extends Plugin {
    el: HTMLElement;

    constructor() {
        super();
    }

    onload() {
        this.el = document.createElement('button');
        this.el.innerText = 'Hello World';
        clientApi.addToolbarRight(this.el);
        console.log('plugin load');
    }

    onunload() {
        console.log('plugin unload')
    }
}
