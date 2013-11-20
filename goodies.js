function drawBall(fill, stroke, radius) {
	var g_canvas = document.createElement('canvas');
	g_canvas.width = radius*2 + 4;
	g_canvas.height = radius*2 + 4;
	var g_context = g_canvas.getContext("2d");

	g_context.arc(radius+2,radius+2,radius-1.5,0,Math.PI*2,false);

	g_context.fillStyle = fill;
	g_context.strokeStyle = stroke;
	g_context.lineWidth = 3;

	g_context.stroke();
	g_context.fill();

	return g_canvas;
}

var gumdrops = {
	'green': drawBall('#0f0', '#030', 8),
	'red': drawBall('#f00', '#300', 8),
	'blue': drawBall('#00f', '#003', 8),
	'gold': drawBall('#ff0', '#330', 8),
};

function Goody (points, x, y, vx, vy) {
	this.x = x;
	this.y = y;

	this.vx = vx;
	this.vy = vy;

	this.points = points;

	if (points > 0) {
		if (points < 100) {
			this.color = 'green';
			this.effect = ['#', 0];
		} else {
			this.color = 'gold';
			this.effect = ['rgba(255,255,0,$)', 60];
		}
	} else if (points < 0) {
		this.color = 'red';
		this.effect = ['rgba(255,0,0,$)', 30];
	} else {
		this.color = 'blue';
		this.effect = ['rgba(0,0,255,$)', 60];
	}

	this.radius = 8;

	this.tick = function (mult, magnet, mx, my) {
		if (this.points > 0 && magnet) {
			var d = dist2(mx, my, this.x, this.y);

			var correction = magnet / (d * d);
			
			if (this.points >= 100) correction = -correction;
			this.vx += correction * (mx - this.x);
			this.vy += correction * (my - this.y);
		}

		this.x += mult * this.vx;
		this.y += mult * this.vy;
	}

	this.draw = function (ctx) {
		ctx.drawImage(gumdrops[this.color], this.x - this.radius - 2, this.y - this.radius - 2);
	}
}

function PowerUp (style, goody) {
	this.__proto__ = goody;

	this.style = style;

	this.effect[1] = 0;
	this.points = 0;
	this.radius = 10;

	this.countdown = 60;

	this.draw = function (ctx) {
		ctx.save();
		ctx.fillStyle = '#000';
		ctx.strokeStyle = '#000';
		ctx.translate(this.x, this.y);
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
		ctx.lineWidth = 2;
		if (this.style == 'x') {
			ctx.moveTo(-this.radius/2.5, -this.radius/2.5);
			ctx.lineTo(this.radius/2.5, this.radius/2.5);
			ctx.moveTo(-this.radius/2.5, this.radius/2.5);
			ctx.lineTo(this.radius/2.5, -this.radius/2.5);
		} else {
			ctx.stroke();
			ctx.beginPath();
			if (!--this.countdown) this.countdown = 120;
			var r = this.radius * (Math.abs(this.countdown - 60) / 120);
			var grd = ctx.createRadialGradient(0, 0, r, 0, 0, this.radius);
			grd.addColorStop(0, '#fff');
			grd.addColorStop(1, '#000');
			ctx.fillStyle = grd;
			ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
			ctx.fill();
		}
		ctx.stroke();
		ctx.restore();
	}
}
