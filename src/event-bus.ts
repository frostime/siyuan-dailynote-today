
class EventBus {
    events: {[key: string]: Function[]} = {};

    EventSetting = 'UpdateSetting';
  
    constructor() {}
  
    subscribe(eventName: string, callback: Function) {
      if (eventName in this.events) {
        this.events[eventName].push(callback);
      } else {
        this.events[eventName] = [callback];
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

