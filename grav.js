grav = .1;

function dist2(x1, y1, x2, y2) {
	return ((x1 - x2)*(x1 - x2)) + ((y1 - y2)*(y1 - y2));
}

function Wind () {
	this.getWindAt = function (x, y) {
		return [0, -.19 - 0.01*(y / 50)];
	}
}

paused = false;
addEventListener('keydown', function (e) {if (e.keyCode==80) paused=!paused});
started = false;
mob = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (mob) {
	canvas.addEventListener('click', function () {pause = !pause});
}

var challenge;
var brag;

function fbCallback (result) {
	console.log('fb:', result);
}

function go() {
	if (paused) {
		setTimeout(go, 400);
		return;
	}
	var start = new Date();

	var canvas = document.getElementById('c');
	var ctx = canvas.getContext('2d');
	document.getElementById('fbld').classList.add('hidden');

	canvas.width = window.innerWidth - 20;
	canvas.height = window.innerHeight - 20;

	var diff = canvas.width / 400;
	var glider = new Glider(canvas.width/2, 100);
	var wind = new Wind();
	var goodies = [new Goody(1, canvas.width/2, 370, 0, 0)];
	var effects = {};
	var trails = 0;
	var speed = 1;
	var difficulty = 7;

	addEventListener('keydown', function(e){glider.key(true, e.keyCode)});
	addEventListener('keyup', function(e){glider.key(false, e.keyCode)});
	if (mob) {
		if (window.DeviceOrientationEvent) {
			addEventListener('deviceorientation', function (e) { glider.orient(e.gamma) }, false);
		}
	}

	challenge = function () {
		FB.ui({method: 'apprequests',
			title: 'A Leaf on the Wind',
			message: 'I scored ' + glider.score + ' points. Can you beat it?',
		}, fbCallback);
	}

	brag = function () {
		FB.ui({method: 'feed',
			description: 'I just scored ' + glider.score + ' points. Can you beat it?',
			caption: 'Watch how I soar.',
			picture: 'http://www.anism.org/lotw/lotw_icon.png',
			link: 'http://www.anism.org/lotw/',
			name: 'A Leaf on the Wind'
		}, fbCallback);
	}

	function stop () {
		ctx.fillStyle = 'rgba(255,255,255,.5)';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = '#000';
		ctx.textAlign = 'center';

		ctx.font = '30pt Calibri';
		ctx.fillText('game over', canvas.width/2, canvas.height/2 - 80);
		ctx.font = '10pt Calibri';
		ctx.fillText('watch how i soar.', canvas.width/2, 12);
		ctx.font = '24pt Calibri';
		var seconds = Math.floor((new Date - start) / 1000);
		ctx.fillText('' + glider.score + ' point' + (glider.score != 1? 's': '') + ' in ' + seconds + ' second' + (seconds != 1? 's': '') + '.', canvas.width/2, canvas.height/2 - 20);
		ctx.fillText('' + glider.snitches + ' snitch' + (glider.snitches != 1? 'es': '') + ' caught. ', canvas.width/2, canvas.height/2 + 15);
	       	ctx.fillText('' + glider.damages + ' damage taken.', canvas.width/2, canvas.height/2 + 50);
		ctx.font = '16pt Calibri';
		ctx.fillText('press \'p\' to play again.', canvas.width/2, canvas.height/2 + 100);

		document.getElementById('fbld').classList.remove('hidden');

		if (connected) {
			FB.api('/me/scores/', 'post', { score: glider.score }, function (response) {
				console.log('score: ', response);
			});
		} else {
			ctx.font = '14pt Calibri';
			ctx.fillText('connect with facebook to challenge your friends!', canvas.width/2, canvas.height/2 + 140);
		}

		paused = true;
		started = false;
		go();
	}

	function addGoody () {
		var x = Math.floor(Math.random() * (canvas.width - 16)) + 8;
		var vy = Math.floor(Math.random() * 3) + 1;
		var points = (Math.random() < 0.4)? 1: -1;

		if (Math.random() < (0.04 / (glider.lives + 1))) points = 0;
		if (Math.random() < 0.001) {
			vy = 5;
			points = 20;
		}

		var goody = new Goody(points * vy, x, -20, 0, vy);

		if (Math.random() < 0.03) {
			var styles = ['+', '-', 'm', 't', '.', ',', 's'];
			var style = styles[Math.floor(Math.random()*styles.length)];
			goody = new PowerUp(style, goody);
		}

		if (Math.random() < (0.04 / (glider.multiplier * glider.multiplier))) {
			goody = new PowerUp('x', goody);
		}

		goodies.push(goody);
	}

	powerUpDraws = {
		'+': function (ctx) {
			ctx.lineWidth = 10;
			ctx.beginPath();
			ctx.moveTo(-50, 0);
			ctx.lineTo(50, 0);
			ctx.moveTo(0, -50);
			ctx.lineTo(0, 50);
			ctx.stroke();
		},
		'-': function (ctx) {
			ctx.lineWidth = 10;
			ctx.beginPath();
			ctx.moveTo(-50, 0);
			ctx.lineTo(50, 0);
			ctx.stroke();
		},
		'm': function (ctx) {
			ctx.lineWidth = 10;
			ctx.beginPath();

			ctx.arc(0, 0, 50, Math.PI, 0, false);

			ctx.moveTo(-50, 0);
			ctx.lineTo(-50, 50);
			ctx.lineTo(-30, 50);
			ctx.lineTo(-30, 0);

			ctx.arc(0, 0, 30, Math.PI, 0, false);

			ctx.moveTo(50, 0);
			ctx.lineTo(50, 50);
			ctx.lineTo(30, 50);
			ctx.lineTo(30, 0);

			ctx.moveTo(-50, 40);
			ctx.lineTo(-30, 40);

			ctx.stroke();
		},
		't': function (ctx) {
			ctx.lineWidth = 10;
			ctx.beginPath();
			ctx.arc(0, 0, 50, 0, Math.PI, false);

			ctx.stroke();
		},
		'.': function (ctx) {
			ctx.lineWidth = 10;
			ctx.beginPath();

			ctx.arc(0, 0, 50, 0, Math.PI * 2, false);

			ctx.moveTo(50, 0);
			ctx.lineTo(30, 0);
			ctx.moveTo(-50, 0);
			ctx.lineTo(-30, 0);
			ctx.moveTo(0, 50);
			ctx.lineTo(0, 30);
			ctx.moveTo(0, -50);
			ctx.lineTo(0, -30);

			ctx.moveTo(-20, 0);
			ctx.lineTo(20, 0);
			ctx.moveTo(0, -20);
			ctx.lineTo(0, 20);

			ctx.stroke();
		},
		',': function (ctx) {
			ctx.lineWidth = 10;
			ctx.beginPath();
			ctx.arc(0, 0, 50, 0, Math.PI * 2, false);

			ctx.moveTo(50, 0);
			ctx.lineTo(30, 0);
			ctx.moveTo(-50, 0);
			ctx.lineTo(-30, 0);
			ctx.moveTo(0, 50);
			ctx.lineTo(0, 30);
			ctx.moveTo(0, -50);
			ctx.lineTo(0, -30);

			ctx.moveTo(-20, 0);
			ctx.lineTo(20, 0);

			ctx.stroke();
		}
	};

	var powerdowns = [];

	var powerUpDoes = {
		'+': function () {
			glider.halfWidth *= 2;
			powerdowns.push([900, function () {
					glider.halfWidth /= 2;
					}, '+',
					function (ctx, ticksRemaining) {
					var t = 120 - (900 - ticksRemaining);
					if (t < 0) return;

					ctx.save();
					ctx.translate(canvas.width/2, canvas.height/2);
					ctx.strokeStyle = 'rgba(0,0,0,$)'.replace(/\$/, t / 480);
					var factor = 360 / (240 + t);
					ctx.scale(factor, factor);
					powerUpDraws['+'](ctx);
					ctx.restore();
					}]);
		},
		'-': function () {
			glider.halfWidth /= 2;
			powerdowns.push([900, function () {
					glider.halfWidth *= 2;
					}, '-',
					function (ctx, ticksRemaining) {
					var t = 120 - (900 - ticksRemaining);
					if (t < 0) return;

					ctx.save();
					ctx.translate(canvas.width/2, canvas.height/2);
					ctx.strokeStyle = 'rgba(0,0,0,$)'.replace(/\$/, t / 480);
					var factor = 360 / (240 + t);
					ctx.scale(factor, factor);
					powerUpDraws['-'](ctx);
					ctx.restore();
					}]);
		},
		'm': function () {
			glider.magnet += 3000;
			powerdowns.push([900, function () {
					glider.magnet -= 3000;
					}, 'm',
					function (ctx, ticksRemaining) {
					var t = 120 - (900 - ticksRemaining);
					if (t < 0) return;

					ctx.save();
					ctx.translate(canvas.width/2, canvas.height/2);
					ctx.strokeStyle = 'rgba(0,0,0,$)'.replace(/\$/, t / 480);
					var factor = 360 / (240 + t);
					ctx.scale(factor, factor);
					powerUpDraws['m'](ctx);
					ctx.restore();
					}]);
		},
		't': function () {
			trails++;
			powerdowns.push([900, function () {
					trails--;
					}, 't',
					function (ctx, ticksRemaining) {
					var t = 120 - (900 - ticksRemaining);
					if (t < 0) return;

					ctx.save();
					ctx.translate(canvas.width/2, canvas.height/2);
					ctx.strokeStyle = 'rgba(0,0,0,$)'.replace(/\$/, t / 480);
					var factor = 360 / (240 + t);
					ctx.scale(factor, factor);
					powerUpDraws['t'](ctx);
					ctx.restore();
					}]);
		},
		'.': function () {
			speed *= 2;
			powerdowns.push([900, function () {
					speed /= 2;
					}, '.',
					function (ctx, ticksRemaining) {
					var t = 120 - (900 - ticksRemaining);
					if (t < 0) return;

					ctx.save();
					ctx.translate(canvas.width/2, canvas.height/2);
					ctx.strokeStyle = 'rgba(0,0,0,$)'.replace(/\$/, t / 480);
					var factor = 360 / (240 + t);
					ctx.scale(factor, factor);
					powerUpDraws['.'](ctx);
					ctx.restore();
					}]);
		},
		',': function () {
			speed /= 2;
			powerdowns.push([900, function () {
					speed *= 2;
					}, ',',
					function (ctx, ticksRemaining) {
					var t = 120 - (900 - ticksRemaining);
					if (t < 0) return;

					ctx.save();
					ctx.translate(canvas.width/2, canvas.height/2);
					ctx.strokeStyle = 'rgba(0,0,0,$)'.replace(/\$/, t / 480);
					var factor = 360 / (240 + t);
					ctx.scale(factor, factor);
					powerUpDraws[','](ctx);
					ctx.restore();
					}]);
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
			if (powerdowns[i][3]) powerdowns[i][3](ctx, powerdowns[i][0]);
		}
	}

	function drawStart () {
		if (started || paused) return;

		ctx.save();

		ctx.fillStyle = 'rgba(255,255,255,.5)';
		ctx.fillRect(0,0,canvas.width,canvas.height);

		ctx.fillStyle = '#000';
		ctx.textAlign = 'center';

		ctx.font = '36pt Calibri';
		ctx.fillText('a leaf on the wind', canvas.width/2, 40);

		ctx.font = '12pt Calibri';
		ctx.fillText('left and right, or \'a\' and \'d\', to turn your glider. \'p\' to pause.', canvas.width/2, 140);
		ctx.fillText('catch green orbs to get points. orbs that move faster give more points.', canvas.width/2, 170);
		ctx.fillText('avoid red orbs. each red orb costs you a life.', canvas.width/2, 200);
		ctx.fillText('you get 3 lives. catch a blue orb to gain a life.', canvas.width/2, 230);
		ctx.fillText('the golden snitch is very rare. it is worth 100 points.', canvas.width/2, 260);
		ctx.fillText('power-ups do a variety of things, not all of them good.', canvas.width/2, 290);
		ctx.fillText('one last thing: the more you win, the harder it gets.', canvas.width/2, 320);
		ctx.fillText('ready? catch this orb to begin.', canvas.width/2, 350);

		ctx.restore();
	}

	function drawScore () {
		if (!started) return;

		var hw = canvas.width / 2;

		ctx.save();
		ctx.fillStyle = 'rgba(0,0,0,.25);';
		ctx.strokeStyle = 'rgba(0,0,0,.5);';

		ctx.font = '96pt Calibri';
		var s1 = glider.score.toString();
		var size1 = ctx.measureText(s1).width;

		ctx.textAlign = 'left';
		ctx.font = '24pt Calibri';
		var s2 = 'x' + glider.multiplier;
		var size2 = ctx.measureText(s2).width;

		ctx.font = '96pt Calibri';
		ctx.fillText(s1, hw - (size1 + size2)/2, canvas.height - 4);
		ctx.font = '24pt Calibri';
		ctx.fillText(s2, hw - (size2 - size1)/2, canvas.height - 4);

		for (var i = 0; i < glider.lives; i++) {
			var y = canvas.height - (90 - 4*i);
			ctx.fillRect(hw - (size2 - size1)/2, y, size2 - 4, 2);
		}
		for (var i = 0; i < powerdowns.length; i++) {
			var icon = powerUpDraws[powerdowns[i][2]];
			if (icon) {
				ctx.save();
				ctx.translate(hw - (size2 - size1)/2 + (i % 2) * 16 + 6, canvas.height - 80 + 4 * glider.lives + Math.floor(i / 2) * 16);
				ctx.scale(0.12, 0.12);
				icon(ctx);
				ctx.restore();
			}
		}

		ctx.restore();
	}

	function draw () {
		if (!paused) {
			if (trails) {
				ctx.save();
				ctx.fillStyle = 'rgba(255, 255, 255, .05)';
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.restore();
			} else ctx.clearRect(0, 0, canvas.width, canvas.height);

			if (started) {
				drawScore();
				drawUps();
			}

			glider.draw(ctx, canvas.width, canvas.height);

			for (var g = 0; g < goodies.length; g++) {
				goodies[g].draw(ctx, canvas.height + 20);
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
			if (tick()) {
				stop();
				return;
			}

			if (!started) drawStart();
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

		for (var g = 0; g < goodies.length; g++) {
			if (glider.collideWith(goodies[g], canvas.width)) {
				glider.givePoints(Math.ceil(speed * goodies[g].points));

				var doEffect = true;
				if (!started) {
					started = true;
				} else if (goodies[g].style) powerUpDoes[goodies[g].style]();
				else if (goodies[g].points < 0) {
					if (glider.shields) {
						doEffect = false;
						glider.score -= goodies[g].points;
					}
					if (glider.damage()) return true;
				} else if (goodies[g].points == 0) {
					glider.lives++;
				}

				if (doEffect) effects[goodies[g].effect[0]] = goodies[g].effect[1];
				goodies.splice(g, 1);
			} else {
				if (goodies[g].tick(speed, glider.magnet, glider.x, glider.y) > canvas.width*2) {
					goodies.splice(g, 1);
					continue;
				}
			}
		}

		glider.tick(1, wind, canvas.height);
		while (glider.x > canvas.width) glider.x -= canvas.width;
		while (glider.x < 0) glider.x += canvas.width;

		if (!started && glider.y > canvas.width + 50) {
			glider = new Glider(canvas.width / 2, 100);
			effects['rgba(255,0,0,$)'] = 60;
		}

		if (started) {
			var chance = diff * (1 - difficulty / Math.log(glider.score+(Math.pow(Math.E,difficulty + 0.01))));
			while (Math.random() < chance) addGoody();
		}

		return false;
	}

	window.requestAnimationFrame(draw);
}
