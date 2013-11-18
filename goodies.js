function Goody (points, x, y, vx, vy) {
	this.x = x;
	this.y = y;

	this.vx = vx;
	this.vy = vy;

	this.points = points;

	if (points > 0) {
		if (points < 100) {
			this.fs = '#0f0';
			this.ss = '#030';
			this.effect = [this.fs, 0];
		} else {
			this.fs = '#ff0';
			this.ss = '#330';
			this.effect = ['rgba(255,255,0,$)', 60];
		}
	} else if (points < 0) {
		this.fs = '#f00';
		this.ss = '#300';
		this.effect = ['rgba(255,0,0,$)', 30];
	} else {
		this.fs = '#00f';
		this.ss = '#003';
		this.effect = ['rgba(0,0,255,$)', 60];
	}

	this.radius = 8;

	this.tick = function (magnet, mx, my) {
		if (this.points > 0 && magnet) {
			var d = dist2(mx, my, this.x, this.y);

			var correction = magnet / (d * d);
			console.log(correction);
			
			if (this.points >= 100) correction = -correction;
			this.vx += correction * (mx - this.x);
			this.vy += correction * (my - this.y);
		}

		this.x += this.vx;
		this.y += this.vy;
	}

	this.draw = function (ctx) {
		ctx.save();
		ctx.fillStyle = this.fs;
		ctx.strokeStyle = this.ss;
		ctx.translate(this.x, this.y);
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.restore();
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
			ctx.moveTo(-this.radius/2, -this.radius/2);
			ctx.lineTo(this.radius/2, this.radius/2);
			ctx.moveTo(-this.radius/2, this.radius/2);
			ctx.lineTo(this.radius/2, -this.radius/2);
			ctx.stroke();
		} else {
			ctx.stroke();
			if (!--this.countdown) this.countdown = 60;
			if (this.countdown > 30) {
				ctx.arc(0, 0, this.radius/3, 0, Math.PI * 2, false);
				ctx.fill();
			}
		}
		ctx.restore();
	}
}
