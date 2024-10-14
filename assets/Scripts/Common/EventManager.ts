interface EventData {
    eventName: string;
    callback: Function;
}

/**
 * @description Method decorator to register the method into each class map.
 * @param event Event name
 */
export function register(event: string) {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        let eventDatas = EventManager.classEventMap.get(target.constructor);
        if (!eventDatas) {
            eventDatas = [];
            EventManager.classEventMap.set(target.constructor, eventDatas);
        }

        const callback: Function = target[property];

        eventDatas.push({ eventName: event, callback });
    };
}

/**
 * @description Preload all event methods which is registered.
 */
export function preloadEvents<T extends { new (...args: any[]): {} }>(constructor: T) {
    let onEnableFunc = constructor.prototype['onEnable'];
    let onDisableFunc = constructor.prototype['onDisable'];

    constructor.prototype['onEnable'] = function () {
        let events = EventManager.classEventMap.get(constructor);

        if (!events) {
            cc.warn('[!] You have to use @register decorator to your class methods.');
            return;
        }

        events.forEach((event) => {
            EventManager.on(event.eventName, event.callback, this);
        });
        onEnableFunc && onEnableFunc.call(this);
    };

    constructor.prototype['onDisable'] = function () {
        let events = EventManager.classEventMap.get(constructor);

        if (!events) return;

        events.forEach((event) => {
            EventManager.off(event.eventName, event.callback, this);
        });
        onDisableFunc && onDisableFunc.call(this);
    };
}

export class EventManager {
    public static classEventMap: Map<object, EventData[]> = new Map();

    private static eventTarget: cc.EventTarget = new cc.EventTarget();

    public static on(event: string, callback: Function, target?: object) {
        this.eventTarget.on(event, callback, target);
    }

    public static off(event: string, callback: Function, target?: object) {
        this.eventTarget.off(event, callback, target);
    }

    public static emit(event: string, ...args: any) {
        this.eventTarget.emit(event, ...args);
    }
}
