console.log('Curves PlayGround');
class vec2 {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
class circle extends vec2 {
    path: Path2D;
    static all: circle[] = [];
    mouseIn: boolean = false;
    radius: number;
    constructor(x: number, y: number, radius: number) {
        super(x, y);
        this.radius = radius;
        this.path = new Path2D();

        this.path.arc(this.x, this.y, radius, 0, 2 * Math.PI);
        circle.all.push(this);
    }
    draw(ctx: CanvasRenderingContext2D) {
        this.mouseIn ? (ctx.fillStyle = 'red') : (ctx.fillStyle = 'green');
        ctx.fill(this.path);
    }
    check(ctx: CanvasRenderingContext2D, x: number, y: number) {
        return ctx.isPointInPath(this.path, x, y);
    }
    setPos(x: number, y: number, radius?: number) {
        this.x = x;
        this.y = y;
        this.path = new Path2D();
        this.path.arc(this.x, this.y, radius ? radius : this.radius, 0, 2 * Math.PI);
    }
}
class main {
    el: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    mouse: boolean = false;
    selected: circle[] = [];
    points: circle[];
    offset = 0.01;
    count = 1 / this.offset;
    index = 0;
    constructor() {
        this.el = <HTMLCanvasElement>document.getElementById('canvas');
        this.ctx = <CanvasRenderingContext2D>this.el.getContext('2d');

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

        let prevPoint: circle;
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
            let last = this.points.reduce<vec2[]>(this.reduceCurves(t), []);
            let state = [last];
            do {
                last = last.reduce<vec2[]>(this.reduceCurves(t), []);
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
    reduceCurves(t: number) {
        return (p: vec2[], c: vec2, i: number, a: vec2[]) => {
            if (i !== 0) p.push(this.curveDot(a[p.length], c, t));
            return p;
        };
    }
    curveDot(p1: vec2, p2: vec2, t: number) {
        return new vec2(p1.x + t * (p2.x - p1.x), p1.y + t * (p2.y - p1.y));
    }
    mousemove(e: MouseEvent) {
        circle.all.forEach((p) => {
            if (p.check(this.ctx, e.offsetX, e.offsetY)) {
                p.mouseIn = true;
            } else {
                p.mouseIn = false;
            }
        });
        if (this.mouse && this.selected.length) {
            this.selected.forEach((p) => {
                p.setPos(e.offsetX, e.offsetY);
            });
        }
    }
    mousedown(e: MouseEvent) {
        this.selected = circle.all.filter((p) => p.mouseIn);
        console.log(circle.all.filter((p) => p.mouseIn));
        this.mouse = true;
        /* if (++this.index >= this.count) {
            this.index = 0;
        } */
        console.log(this.index);
    }
    mouseup(e: MouseEvent) {
        this.selected = [];
        this.mouse = false;
    }
}

new main();
