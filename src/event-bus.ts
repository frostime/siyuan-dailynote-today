/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-05-28 18:05:39
 * @FilePath     : /src/event-bus.ts
 * @LastEditTime : 2024-10-09 17:07:56
 * @Description  : For old time compatibility.
 */

class EventBus {
    events: { [key: string]: Function[] } = {};

    EventUpdateAll = 'UpdateAll';
    EventSetting = 'UpdateSetting';
    EventSettingLoaded = 'SettingLoaded';

    constructor() { }

    subscribe(eventName: string, callback: Function) {
        if (eventName in this.events) {
            this.events[eventName].push(callback);
        } else {
            this.events[eventName] = [callback];
        }
    }

    unSubscribe(eventName: string, callback: Function) {
        if (eventName in this.events) {
            let index = this.events[eventName].indexOf(callback);
            if (index >= 0) {
                this.events[eventName].splice(index, 1);
            }
        }
    }

    publish(eventName: string, data: any) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName].forEach((callback) => callback(data));
    }
}


export const eventBus = new EventBus();

