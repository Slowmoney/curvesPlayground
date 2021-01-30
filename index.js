"use strict";
console.log('Curves PlayGround');
class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class circle extends vec2 {
    constructor(x, y, radius) {
        super(x, y);
        this.mouseIn = false;
        this.radius = radius;
        this.path = new Path2D();
        this.path.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        circle.all.push(this);
    }
    draw(ctx) {
        this.mouseIn ? (ctx.fillStyle = 'red') : (ctx.fillStyle = 'green');
        ctx.fill(this.path);
    }
    check(ctx, x, y) {
        return ctx.isPointInPath(this.path, x, y);
    }
    setPos(x, y, radius) {
        this.x = x;
        this.y = y;
        this.path = new Path2D();
        this.path.arc(this.x, this.y, radius ? radius : this.radius, 0, 2 * Math.PI);
    }
}
circle.all = [];
class main {
    constructor() {
        this.mouse = false;
        this.selected = [];
        this.offset = 0.01;
        this.count = 1 / this.offset;
        this.index = 0;
        this.el = document.getElementById('canvas');
        this.ctx = this.el.getContext('2d');
        this.points = [new circle(100, 350, 10), new circle(200, 150, 10), new circle(130, 50, 10), new circle(150, 50, 10), new circle(300, 50, 10), new circle(300, 150, 10)];
        this.mousemove = this.mousemove.bind(this);
        this.mousedown = this.mousedown.bind(this);
        this.mouseup = this.mouseup.bind(this);
        document.addEventListener('mousemove', this.mousemove);
        document.addEventListener('mousedown', this.mousedown);
        document.addEventListener('mouseup', this.mouseup);
        setInterval(() => {
            if (++this.index >= this.count) {
                this.index = 0;
            }
        }, 200);
        requestAnimationFrame(this.loop.bind(this));
    }
    loop() {
        this.ctx.clearRect(0, 0, this.el.width, this.el.height);
        let prevPoint;
        circle.all.forEach((p) => {
            if (prevPoint) {
                this.ctx.beginPath();
                this.ctx.moveTo(prevPoint.x, prevPoint.y);
                this.ctx.lineTo(p.x, p.y + 2);
                this.ctx.strokeStyle = 'red';
                this.ctx.stroke();
                this.ctx.closePath();
            }
            prevPoint = p;
            p.draw(this.ctx);
        });
        this.ctx.beginPath();
        for (let i = 0; i < this.count; i++) {
            let t = i * this.offset;
            let last = this.points.reduce(this.reduceCurves(t), []);
            let state = [last];
            do {
                last = last.reduce(this.reduceCurves(t), []);
                state.push(last);
            } while (last.length !== 1);
            if (this.index == i) {
                state.forEach((s) => {
                    this.ctx.moveTo(s[0].x, s[0].y);
                    s.forEach((e) => {
                        this.ctx.lineTo(e.x, e.y);
                    });
                });
            }
            last.forEach((p) => {
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + 3);
            });
        }
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.closePath();
        requestAnimationFrame(this.loop.bind(this));
    }
    reduceCurves(t) {
        return (p, c, i, a) => {
            if (i !== 0)
                p.push(this.curveDot(a[p.length], c, t));
            return p;
        };
    }
    curveDot(p1, p2, t) {
        return new vec2(p1.x + t * (p2.x - p1.x), p1.y + t * (p2.y - p1.y));
    }
    mousemove(e) {
        circle.all.forEach((p) => {
            if (p.check(this.ctx, e.offsetX, e.offsetY)) {
                p.mouseIn = true;
            }
            else {
                p.mouseIn = false;
            }
        });
        if (this.mouse && this.selected.length) {
            this.selected.forEach((p) => {
                p.setPos(e.offsetX, e.offsetY);
            });
        }
    }
    mousedown(e) {
        this.selected = circle.all.filter((p) => p.mouseIn);
        console.log(circle.all.filter((p) => p.mouseIn));
        this.mouse = true;
        /* if (++this.index >= this.count) {
            this.index = 0;
        } */
        console.log(this.index);
    }
    mouseup(e) {
        this.selected = [];
        this.mouse = false;
    }
}
new main();
