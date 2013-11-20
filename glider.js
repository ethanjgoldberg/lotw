function Glider (x, y) {
	this.x = x;
	this.y = y;

	this.h = 0;
	this.turn = .05

	this.vx = 0;
	this.vy = 0;

	this.halfWidth = 20;

	this.damages = 0;
	this.snitches = 0;
	this.score = 0;
	this.multiplier = 1;
	this.lives = 3;

	this.shields = 0;
	this.magnet = 0;

	this.draw = function (ctx, width, height) {
		var d = (function (x, y, factor) {
			factor = factor || 1;
			ctx.save();
			if (this.shields) {
				ctx.shadowBlur = 7 * this.shields;
				ctx.shadowColor = '#00f'
			}
			ctx.translate(x, y);
			ctx.rotate(this.h);
			ctx.scale(factor, factor);
			ctx.fillStyle = '#000';
			ctx.fillRect(-this.halfWidth, -1.5, 2*this.halfWidth, 3);
			ctx.restore();
		}).bind(this);

		d(this.x, this.y);
		if (this.x < this.halfWidth) d(this.x + width, this.y);
		if (width - this.x < this.halfWidth) d(this.x - width, this.y);

		if (this.y > height + this.halfWidth) {
			ctx.save();
			ctx.fillStyle = '#000';
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.moveTo(this.x - 6, height - 8);
			ctx.lineTo(this.x + 6, height - 8);
			ctx.lineTo(this.x, height - 2);
			ctx.fill();
			ctx.restore();

			ctx.save();
			var factor = 200 / (this.y - height - this.halfWidth + 200);
			d(this.x, height - 50, factor);
			ctx.restore();
		}
	}

	this.tick = function (mult, wind, height) {
		var r = false;

		if (this.keys.cw) this.h += mult * this.turn;
		if (this.keys.ccw) this.h -= mult * this.turn;

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
			var thisx = this.x + offset;
			var thisy = this.y + 1.5; // since we draw the glider with height 3.

			var dx = goody.x - thisx;
			var dy = goody.y - thisy;

			if (Math.abs(dx) > goody.radius + this.halfWidth + 3) return false;
			if (Math.abs(dy) > goody.radius + this.halfWidth + 3) return false;

			var cosh = Math.cos(-this.h);
			var sinh = Math.sin(-this.h);

			var rotated_x = Math.abs(dx * cosh - dy * sinh);
			var rotated_y = Math.abs(dx * sinh + dy * cosh);

			if (this.halfWidth > rotated_x && goody.radius + 1.5 > rotated_y) return true;
			if (1.5 > rotated_y && goody.radius + this.halfWidth > rotated_x) return true;
			if (dist2(rotated_x, rotated_y, this.halfWidth, 1.5) < goody.radius * goody.radius) return true;
			return false;
		}).bind(this);
		if (collide(0)) return true;
		if (this.x < this.halfWidth && collide(width)) return true;
		if (width - this.x < this.halfWidth && collide(-width)) return true;
		return false;
	}

	this.damage = function () {
		if (this.shields) {
			this.shields--;
			return;
		}
		this.multiplier = 1;
		this.lives--;
		this.damages++;
		return this.lives < 0;
	}

	this.givePoints = function (points) {
		if (points < 100) {
			this.score += points * this.multiplier;
		} else {
			this.score += points;
			this.snitches++;
		}
		if (this.score < 0) this.score = 0;
	}

	this.keys = {
		cw: false,
		ccw: false
	}

	this.key = function(down, code) {
		//console.log(code);
		if (code == 72 || code == 37) {
			this.keys.ccw = down;
		}
		if (code == 84 || code == 39) {
			this.keys.cw = down;
		}
	}

	this.orient = function (gamma) {
		if (gamma == 0) return;

		gamma /= 15;
		this.h += gamma * this.turn;
	}
}
