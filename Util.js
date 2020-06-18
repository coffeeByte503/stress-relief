export function random(min, max, fixed = 0) {
    return Number((Math.random() * (max - min) + min).toFixed(fixed))
}

export function degToRad(degs) {
    return (Math.PI / 180) * degs;
}

export function radToDeg(rad) {
    return rad * (180 / Math.PI)
}

export async function sleep(milis) {
    return new Promise(resolve => setTimeout(resolve, milis));
}

export async function getJSON(url) {
    const response = await fetch(url);
    return response.json();
}

export function createScreen() {
    const canvas = document.createElement("canvas");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    return canvas;
}

export function sum(target, property) {
    let sum = 0;
    for (let name in target) {
        sum += Number(target[name][property]);
    }
    return sum;
}

export class EventEmitter {
    constructor() {
        this.events = {};
    }
    existEvent(type) {
        return typeof this.events[type] === 'object';
    }
    on(type, listener) {
        if (!this.existEvent(type)) {
            this.events[type] = [];
        }
        this.events[type].push(listener);
        return () => this.removeListener(type, listener);
    }
    removeListener(type, listener) {
        if (!this.existEvent(type)) return;

        const idx = this.events[type].indexOf(listener);
        if (idx > -1) {
            this.events[type].splice(idx, 1);
        }
    }
    emit(type, ...args) {
        if (!this.existEvent(type)) return;
        this.events[type].forEach(listener => listener(...args));
    }
}