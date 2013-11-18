grav = .1;

function dist2(x1, y1, x2, y2) {
	return ((x1 - x2)*(x1 - x2)) + ((y1 - y2)*(y1 - y2));
}

function Wind () {
	this.getWindAt = function (x, y) {
		return [0, -.2];
	}
}

paused = false;

function go() {
	if (paused) {
		setTimeout(go, 400);
		return;
	}
	var start = new Date();

	var canvas = document.getElementById('c');
	canvas.width = window.innerWidth * 0.85;
	canvas.height = window.innerHeight * 0.9;
	var diff = canvas.width / 716;
	var ctx = canvas.getContext('2d');

	var score = document.getElementById('score');
	var multiplier = document.getElementById('multiplier');
	var lives = document.getElementById('lives');

	var glider = new Glider();
	var wind = new Wind();
	var goodies = [new Goody(1, 100, -20, 0, 1)];
	var effects = {};
	var trails = 0;
	var speed = 1;

	addEventListener('keydown', function(e){glider.key(true, e.keyCode)});
	addEventListener('keyup', function(e){glider.key(false, e.keyCode)});

	function updateScore () {
		score.innerHTML = glider.score;
		multiplier.innerHTML = 'x' + glider.multiplier;
		lives.innerHTML = '' + glider.lives + ' lives.';
	}

	updateScore();

	function stop () {
		ctx.fillStyle = 'rgba(255,255,255,.5)';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#000';
		ctx.textAlign = 'center';

		ctx.font = '30pt Helvetica';
		ctx.fillText('Game Over.', canvas.width/2, canvas.height/2);
		ctx.font = '16pt Helvetica';
		ctx.fillText('Press \'P\' to play again.', canvas.width/2, canvas.height/2 + 20);
		ctx.font = '30pt Helvetica';
		ctx.fillText('' + glider.score + ' points in ' + Math.floor((new Date() - start) / 1000) + ' seconds.', canvas.width/2, canvas.height/2 + 60);

		paused = true;
		go();
	}

	function addGoody () {
		var x = Math.floor(Math.random() * (canvas.width - 16)) + 8;
		var vy = Math.floor(Math.random() * 3) + 1;
		var points = (Math.random() < 0.4)? 1: -1;

		if (Math.random() < (0.04 / (glider.lives + 1))) points = 0;
		if (Math.random() < 0.001) {
			vy = 4;
			points = 25;
		}

		var goody = new Goody(points * vy, x, -20, 0, vy);

		if (Math.random() < 0.03) {
			var styles = ['+', '-', 'm', 't', '.', ',', 's'];
			var style = styles[Math.floor(Math.random()*styles.length)];
			goody = new PowerUp(style, goody);
		}

		if (Math.random() < 0.03) {
			goody = new PowerUp('x', goody);
		}

		goodies.push(goody);
	}

	var powerdowns = [];

	var powerUpDoes = {
		'+': function () {
			glider.halfWidth *= 2;
			powerdowns.push([900, function () {
				glider.halfWidth /= 2;
			}, '+']);
		},
		'-': function () {
			glider.halfWidth /= 2;
			powerdowns.push([900, function () {
				glider.halfWidth *= 2;
			}, '-']);
		},
		'm': function () {
			glider.magnet += 3000;
			powerdowns.push([900, function () {
				glider.magnet -= 3000;
			}, 'm']);
		},
		't': function () {
			trails++;
			powerdowns.push([900, function () {
				trails--;
			}, 't']);
		},
		'.': function () {
			speed *= 2;
			powerdowns.push([900, function () {
				speed /= 2;
			}, '.']);
		},
		',': function () {
			speed /= 2;
			powerdowns.push([900, function () {
				speed *= 2;
			}, ',']);
		},
		's': function () {
			glider.shields++;
		},
		'x': function () {
			glider.multiplier++;
		}
	};

	function drawUps () {
		for (var i = 0; i < powerdowns.length; i++) {
			ctx.save();
			ctx.font = '12pt Courier';
			ctx.fillText(powerdowns[i][2] + ' ' + powerdowns[i][0], 0, 10 + i*20);
			ctx.restore();
		}
	}

	function draw () {
		if (!paused) {
			if (tick()) {
				stop();
				return;
			}

			if (trails) {
				ctx.save();
				ctx.fillStyle = 'rgba(255, 255, 255, .05)';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();
			} else ctx.clearRect(0, 0, canvas.width, canvas.height);

			drawUps();

			glider.draw(ctx, canvas.width);

			for (var g = 0; g < goodies.length; g++) {
				goodies[g].draw(ctx);
			}

			for (var e in effects) {
				if (effects[e]) {
					effects[e]--;
					ctx.save();
					ctx.fillStyle = e.replace(/\$/, (effects[e] / 120));
					ctx.fillRect(0,0,canvas.width,canvas.height);
					ctx.restore();
				}
			}
		}

		window.requestAnimationFrame(draw);
	}

	function tick () {
		for (var i = 0; i < powerdowns.length; i++) {
			if (!--powerdowns[i][0]) {
				powerdowns[i][1]();
				powerdowns.splice(i, 1);
			}
		}

		if (glider.tick(1, wind, canvas.height)) {
			updateScore();
		}

		while (glider.x > canvas.width) glider.x -= canvas.width;
		while (glider.x < 0) glider.x += canvas.width;

		for (var g = 0; g < goodies.length; g++) {
			if (goodies[g].tick(speed, glider.magnet, glider.x, glider.y)) {
				goodies.splice(g, 1);
				continue;
			}

			if (glider.collideWith(goodies[g], canvas.width)) {
				var doEffect = true;
				if (goodies[g].style) powerUpDoes[goodies[g].style]();
				else if (goodies[g].points < 0) {
					doEffect = !glider.shields;
					if (glider.damage()) return true;
				} else if (goodies[g].points == 0) {
					glider.lives++;
				}

				glider.givePoints(goodies[g].points);
				if (doEffect) effects[goodies[g].effect[0]] = goodies[g].effect[1];

				if (glider.score < 0) glider.score = 0;
				goodies.splice(g, 1);
				updateScore();
			}
		}

		if (Math.random() < diff * (1 - 5 / Math.log(glider.score+(Math.pow(Math.E,5.01))))) addGoody();

		return false;
	}

	window.requestAnimationFrame(draw);
}
