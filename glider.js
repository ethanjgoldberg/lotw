function Glider (x, y) {
	this.x = x;
	this.y = y;

	this.h = 0;
	this.turn = .05

	this.vx = 0;
	this.vy = 0;

	this.halfWidth = 20;

	this.score = 0;
	this.multiplier = 1;
	this.magnet = false;
	this.lives = 3;
	this.shields = 0;

	this.draw = function (ctx, width) {
		var d = (function (offset) {
			ctx.save();
			ctx.shadowBlur = 7 * this.shields;
			ctx.shadowColor = '#00f'
			ctx.translate(this.x + offset, this.y);
			ctx.rotate(this.h);
			ctx.fillRect(-this.halfWidth, 0, 2*this.halfWidth, 3);
			ctx.restore();
		}).bind(this);

		d(0);
		if (this.x < this.halfWidth) d(width);
		if (width - this.x < this.halfWidth) d(-width);
	}

	this.tick = function (mult, wind, height) {
		var r = false;

		if (this.keys.cw) this.h += mult * this.turn;
		if (this.keys.ccw) this.h -= mult * this.turn;

		if (this.y > height + 40) {
			this.vy *= -1;
			this.h *= -1;
			this.y = height + 40;
			this.multiplier = 1;

			r = true;
		}

		var windVec = wind.getWindAt(this.x, this.y);
		windVec[0] -= this.vx;
		windVec[1] -= this.vy;

		var dotted = windVec[0] * Math.cos(this.h + Math.PI/2) + windVec[1] * Math.sin(this.h + Math.PI/2);

		this.vx += mult * dotted * Math.cos(this.h + Math.PI/2);
		this.vy += mult * dotted * Math.sin(this.h + Math.PI/2);
		
		this.vy += mult * grav;

		this.x += mult * this.vx;
		this.y += mult * this.vy;

		return r;
	}

	this.collideWith = function (goody, width) {
		var collide = (function (offset) {
			var dx = goody.x - this.x;
			var dy = goody.y - this.y;

			if (Math.abs(dx) > this.halfWidth + goody.radius) return false;
			if (Math.abs(dy) > this.halfWidth + goody.radius) return false;

			var dotted = dx * Math.cos(this.h) + dy * Math.sin(this.h);

			var px = this.x + dotted * Math.cos(this.h);
			var py = this.y + dotted * Math.sin(this.h);

			if (dist2(px, py, this.x, this.y) > this.halfWidth*this.halfWidth)
				return false;
			if (dist2(px, py, goody.x, goody.y) > goody.radius*goody.radius)
				return false;
			return true;
		}).bind(this);
		if (collide(0)) return true;
		if (this.x < this.halfWidth && collide(width)) return true;
		if (width - this.x < this.halfWidth && collide(-width)) return true;
	}

	this.damage = function () {
		if (this.shields) {
			this.shields--;
			return;
		}
		this.multiplier = 1;
		this.lives--;
		return this.lives < 0;
	}

	this.givePoints = function (points) {
		this.score += points * this.multiplier;
	}

	this.keys = {
		cw: false,
		ccw: false
	}

	this.key = function(down, code) {
		//console.log(code);
		if (down && code == 80) paused = !paused;
		if (code == 72 || code == 37) {
			this.keys.ccw = down;
		}
		if (code == 84 || code == 39) {
			this.keys.cw = down;
		}
	}
}
