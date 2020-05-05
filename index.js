//global vars
let SCREEN_WIDTH = 0,
    SCREEN_HEIGHT = 0,
    TOUCHING = false,
    SPAWN_VELOCITY = 10,
    SPAWN_VALUE = 0,
    names = [],
    screen = null,
    context = null,
    renderer,
    entities = new Set();

async function main() {
    //init
    screen = createScreen();
    resize();

    context = screen.getContext("2d");
    setFont()

    graphics = new Graphics({
        heart: "img/heart.png",
        sololearn: "img/sololearn.png",
        py: "img/py.png",
        cs: "img/cs.png",
        js: "img/js.png",
        cpp: "img/cpp.png",
        java: "img/java.svg"
    }, context)
    names = ["heart", "sololearn", "py", "cs", "js", "cpp", "java"]

    //load
    await Promise.all([
        graphics.load()
    ])

    /*event listenners - mobile & pc*/
    window.addEventListener("resize", resize);
    window.addEventListener("resize", setFont);
    listen(screen, ["touchstart", "mousedown"],
        (e) => {
            TOUCHE_EVENT = e;
            TOUCHING = true;
        });
    listen(screen, ["touchmove", "mousemove"], e => TOUCHE_EVENT = e);
    listen(screen, ["touchend", "mouseup"], () => TOUCHING = false);

    //renderer
    renderer = new Renderer(update);
    renderer.start();

    $("#app").appendChild(screen);

    //msg
    alert("Press and move your finger or mouse");
}
window.addEventListener("load", main);

//global funtions
const $ = element => document.querySelector(element);

function listen(element, types = [], callback) {
    types.forEach(type => element.addEventListener(type, callback));
}

function random(max, min, fixed = 0) {
    return Number((Math.random() * (max - min) + min).toFixed(fixed));
}

function setFont() {
    context.font = "20px sans-serif";
    context.fillStyle = "#fff";
}

function resize() {
    screen.width = SCREEN_WIDTH = window.innerWidth;
    screen.height = SCREEN_HEIGHT = window.innerHeight;
}

function createScreen() {
    const canvas = document.createElement("canvas");
    return canvas;
}

//
function dropIcons(e) {
    let target = e.touches ? e.touches[0] : e;
    const {
        clientX,
        clientY
    } = target;
    entities.add(new Icon(clientX, clientY));
}

function update(dt) {
    context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    SPAWN_VALUE += dt * 100;
    if (TOUCHING && SPAWN_VALUE >= SPAWN_VELOCITY) {
        dropIcons(TOUCHE_EVENT);
        SPAWN_VALUE = 0;
    }

    entities.forEach(entity => {
        entity.draw();
        if (entity.update(dt)) entities.delete(entity);
    });

    context.fillText("Made with love for sololearn", 10, SCREEN_HEIGHT - 20);
}

//classes
class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

class Entity {
    constructor(x, y, w, h) {
        this.pos = new Vector(x, y);
        this.size = new Vector(w, h);
        this.vel = new Vector();
    }
    update(dt) {
        this.pos.x += dt * this.vel.x;
        this.pos.y += dt * this.vel.y;

        return this.bottom < 0 || this.right < 0 || this.left > SCREEN_WIDTH;
    }
    draw() {
        /*abstract*/
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }
    get top() {
        return this.pos.y;
    }
    get left() {
        return this.pos.x;
    }
    get right() {
        return this.pos.x + this.size.x;
    }
}

/*icon*/
class Icon extends Entity {
    constructor(x, y) {
        const size = random(30, 35);
        super(x, y, size, size);
        this.vel.x = random(-5, 5, 3);
        this.vel.y = random(-8, -18, 3);
        this.val = random(0, 1);
        this.name = random(0, names.length - 1);

    }
    draw() {
        const buffer = graphics.get(names[this.name]);
        context.drawImage(buffer, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}

/*renderer*/
class Renderer {
    constructor(callback) {
        this.callback = callback;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.request = null;

        this.update = ms => {
            this.deltaTime = ms - this.lastTime;
            if (ms) this.callback(this.deltaTime / 100);
            this.lastTime = ms;
            this.request = requestAnimationFrame(this.update);
        }
    }
    start() {
        this.request = requestAnimationFrame(this.update);
    }
}

/*loads*/
function loadImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = url;
    })
}
class Load {
    constructor(src, loadFunc) {
        this.src = src;
        this.buffer = new Map();
        this.loadFunc = loadFunc;
    }
    get(name) {
        return this.buffer.get(name);
    }
    async load() {
        const loads = [];
        const names = [];
        let loaded;
        for (let name in this.src) {
            loads.push(this.loadFunc(this.src[name]))
            names.push(name);
        }

        loaded = await Promise.all(loads);

        loaded.forEach((img, i) => this.buffer.set(names[i], img));
    }
}

//graphics
class Graphics extends Load {
    constructor(src, ctx) {
        super(src, loadImage)
        this.ctx = ctx;
    }
    draw(name, x = 0, y = 0, w, h) {
        const buffer = this.get(name);
        if (!w) w = buffer.width;
        if (!h) h = buffer.height;
        this.ctx.drawImage(buffer, x, y, w, h);
    }
}


//add audio-> next version
/*

function loadAudio(url) {
    return new Promise(resolve => {
        const audio = new Audio();
        audio.oncanplay = () => resolve(audio);
        audio.src = url;
    })
}
//audio
class AudioManager extends Load {
    constructor(src) {
        super(src, loadAudio);
        this.volume = 1;
    }
    setVolume(value) {
        this.volume = value > 1 ? 1 : value;
        this.buffer.forEach(au => au.volume = this.volume);
    }
    async play(name) {
        const audio = this.buffer.get(name);
        if (!audio) return;
        await audio.play();
    }
}
*/