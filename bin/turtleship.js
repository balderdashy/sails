/**
 * Module dependencies
 */

var _ = require('lodash');

/**
 * Really shouldn't be doing this right now.
 * Everyone needs a break, right??!
 *
 *               |}
 * \__/,_,_,_,_\__/
 *
 * TODO:	use `ansi` module to make this work for all consoles
 *			for now, all the really fun stuff is disabled.
 *			https://github.com/TooTallNate/ansi.js
 */

module.exports = function setup() {

	function Turtle() {
		var self = this;

		// Components
		this.sail = '|}';
		this.wave1 = ',';
		this.wave2 = '_';
		this.cargo = '\\__/';
		this.deck = '\\__/';

		this.draw = draw;
		this.clearLn = clearLn;
		this.crlf = train('\n');
		this.space = train(' ');
		this.enter = _.partial(drawSome, true);
		this.exit = _.partial(drawSome, false);

		this.up = _.partial(move, 'A');
		this.right = _.partial(move, 'C');
		this.down = _.partial(move, 'B');
		this.left = _.partial(move, 'D');

		this.drawSail = train(this.sail);
		this.drawWave1 = train(this.wave1);
		this.drawWave2 = train(this.wave2);
		this.drawDeck = train(this.deck);
		this.drawCargo = train(this.cargo);

		function drawSome(obscureLeftSide, component, numFrames) {
			if (!obscureLeftSide) numFrames *= -1;
			return draw(obscure(component, numFrames));
		}

		function obscure(component, numFrames) {
			return component.substr(numFrames);
		}

		function move(dir, times) {

			// default to 1 repetition
			times = times || 1;

			draw('\033[<' + times + '>' + dir);
			return self;
		}

		function train(cmd, fn) {
			fn = fn || draw;
			return _.partial(fn, cmd);
		}

		function draw(cmd, times) {

			// default to 1 repetition
			times = times || 1;

			var buffer = '';
			for (var z = 0; z < times; z++) {
				buffer += cmd;
			}
			process.stdout.write(buffer);
			return self;
		}

		function clearLn() {
			draw('\033[<1000>D');
			draw('\033[K');
			return self;
		}
	}


	function Scene(turtle) {

		// Boat dimensions and initial position
		var x_offset = 0,
			boat_width = 4,
			sails_relx = 1;

		// Whether the canvas has been drawn on
		var dirty = false;


		// Metronome (keep track of time passing)
		var t = 0;

		this.tick = function() {
			t++;
		};

		/**
		 * Redraw canvas
		 */

		this.draw = function() {

			turtle.draw('.');

			/**
			 * Lesson learned-- but still leaving this here for posterity.
			 * In case the boat becomes a priority again.  Which it might.
			 */

			//          // Recalculate figure positions
			//          var tugboat_x = t;
			//          // var cargo_lag	= 8;
			//          // var cargo_x		= tugboat_x - cargo_lag;
			//
			//          // Wipe canvas and reset writehead (if necessary)
			//          clear();
			//
			//          // Set dirty flag
			//          dirty = true;
			//
			//
			//          turtle.down()
			//            .left(1000);
			//
			//          // Render cargo
			//          // var cargo = turtle.cargo;
			//          // if (cargo_x < 0) {
			//          // 	cargo = cargo.substr(cargo_x * -1);
			//          // }
			//          // if (cargo_x > 0) {
			//          // 	turtle.drawWave1(cargo_x);
			//          // }
			//
			//          // turtle.draw(cargo);
			//
			//          // Render waves
			//          var wave_start_x = 0; //(cargo_x < 0) ? 0 : cargo_x;
			//          var wave_length = tugboat_x;
			//
			//          // Odd wave
			//          if (t % 2) {
			//            wave_start_x = 1;
			//            turtle.drawWave2();
			//          }
			//          // else {
			//
			//          // }
			//
			//          if (t % 2 === 0) {
			//            for (var w = wave_start_x; w + 1 < wave_length; w++) {
			//              if (w % 2) {
			//                turtle.drawWave2();
			//              } else {
			//                turtle.drawWave1();
			//              }
			//            }
			//          } else if (t % 4 !== 0) {
			//            for (var o = wave_start_x; o + 1 < wave_length; o++) {
			//              if (o % 2) {
			//                turtle.drawWave2();
			//              } else {
			//                turtle.drawWave1();
			//              }
			//            }
			//          } else {
			//            for (var p = wave_start_x; p + 1 < wave_length; p++) {
			//              turtle.drawWave2();
			//            }
			//          }
			//
			//          // Render tugboat body
			//          // Render sails
			//          turtle.left(1000)
			//            .right(tugboat_x)
			//            .drawDeck()
			//            .up()
			//            .left(1000)
			//            .right(tugboat_x)
			//            .space(sails_relx)
			//            .drawSail();
			//
			//          // Draw progress message
			//          turtle.left(1000)
			//            .down(3)
			//            .draw(msg)
			//            .down(1)
			//            .left(1000);

		};


		// Wipe canvas if dirty,
		// then reset dirty flag

		function clear() {
			if (!dirty) return;

			tortoise.up(4)
				.down()
				.clearLn()
				.up()
				.clearLn();

			dirty = false;
		}
	}

	/**
	 * Oh man, here we go.
	 * This is exciting.
	 *
	 * Draw initial scene.
	 */

	var tortoise = new Turtle();
	var scene = new Scene(tortoise);

	return {
		tick: function () {
			scene.tick();
			scene.draw();
		}
	};
};
