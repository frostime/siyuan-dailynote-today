import { openTab, type Custom } from "siyuan";

import DailyNoteView from "@/components/dailynote-view/daily-note-view.svelte";
import type DailyNoteTodayPlugin from "@/index";

const TAB_TYPE = 'dnt-dailynote-view';

export class DailyNoteViewHub {
    private plugin: DailyNoteTodayPlugin;
    private tab: (() => Custom) | null = null;

    constructor(plugin: DailyNoteTodayPlugin) {
        this.plugin = plugin;
    }

    open() {
        if (this.tab === null) {
            this.registerTab();
        }
        openTab({
            app: this.plugin.app,
            custom: {
                id: this.plugin.name + TAB_TYPE,
                icon: 'iconCalendar',
                title: this.plugin.i18n.DailyNoteView.title,
                data: TAB_TYPE,
            },
            keepCursor: false,
        });
    }

    private registerTab() {
        const plugin = this.plugin;
        let container: HTMLDivElement;
        let component: DailyNoteView;
        const hub = this;

        this.tab = this.plugin.addTab({
            type: TAB_TYPE,
            init() {
                this.element.style.display = 'flex';
                container = document.createElement('div');
                container.className = 'dnt-view-tab fn__flex-1';
                this.element.appendChild(container);
                component = new DailyNoteView({
                    target: container,
                    props: {
                        app: plugin.app,
                    },
                });
            },
            beforeDestroy() {
                component?.$destroy();
                container?.remove();
            },
            destroy() {
                hub.tab = null;
            },
        });
    }
}
