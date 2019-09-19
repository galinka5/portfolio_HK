/**
 * Main class for game Spots
 *
 * @author Halyna Kyryliuk
 * */
var field_width;
var field_height;
var context_back;
var context_front;
var level;
var game_field;
var active_spot = null;
var update_handler = null;

var col_count;
var row_count;
var cell_size = 85;
var spot_radius = cell_size/2-2;

var POINT_DEM = 4;
var P_COLOR = 'rgb(200, 0, 0)';
var P_COLOR_A = 'rgb(200, 0, 200)';
var O_COLOR = 'rgb(0, 200, 0)';
var B_COLOR = 'rgb(0, 0, 0)';
var EMPTY = 0;
var PLAYER = 1;
var OPPONENT = 2;
var DUMMY = -1;
var TIME_TO_STEP = 15;

var turn = PLAYER;

var timer_id;
var moving_id;
var timer = TIME_TO_STEP;

var active_x;
var active_y;
var dx;
var dy;
var counter = 0;
var blocked = false;
var active_data=[];

// Game initialization
function initGame(cvs, cvs1, lvl, handler){
	update_handler = handler;
  context_back = cvs.getContext("2d");
	context_front = cvs1.getContext("2d");
	level = lvl;
	game_field = LEVELS[level];
	row_count = game_field.length;
	col_count = game_field[0].length;
	field_width = cvs.width-2;
	field_height = cvs.height;
	cell_size = Math.min(field_width/col_count, field_height/row_count);
	spot_radius = cell_size/2-2;
	drawGameField();
	turn = PLAYER;

	timer_id = setInterval(onTimer, 1000);
  timer = TIME_TO_STEP;
  update_handler({ time: timer, s1: getScore(PLAYER), s2: getScore(OPPONENT) });
}


// Redraw game field
function updateGameField(){
	context_back.clearRect(0, 0, field_width, field_height);
	context_front.clearRect(0, 0, field_width, field_height);
  drawGameField();
  var sp = getScore(PLAYER);
  var so = getScore(OPPONENT);
  res = null;
  if (checkGameFinished()) {
      res = Math.sign(sp - so);
      clearInterval(timer_id);
  }
	update_handler({s1:sp, s2:so, result:res});
}

// On timer: decrimant time or miss step
function onTimer(){
	if  (turn == OPPONENT) return;
	update_handler({time:timer});
	timer--;
	if (timer < 0){
		missStep();
  }
}

// If player miss step
function missStep(){
	update_handler({time:0});
	onSpotStops();
}

// Drawing grid and all spots
function drawGameField(){
	for (var i = 0; i<row_count; i++){
		for (var j = 0; j<col_count; j++){
			switch (game_field[i][j]){
				case EMPTY:
					drawCell(i, j, false);
					break;
				case PLAYER:
					drawCell(i, j);
					drawSpot(i, j, P_COLOR);
					break;
				case OPPONENT:
					drawCell(i, j);
					drawSpot(i, j, O_COLOR);
					break;
				case DUMMY:
					drawCell(i, j, true);
					break;
			}
		}
	}
}

// Draw cell depanding for its type
function drawCell(row, col, fill){
	if (fill){
		context_back.fillStyle = B_COLOR;
		context_back.fillRect(col*cell_size, row*cell_size, cell_size, cell_size);
	}else context_back.strokeRect(col*cell_size, row*cell_size, cell_size, cell_size);
}

// Draw spot of defined color
function drawSpot(row, col, color, context){
	var d = (cell_size - 2*spot_radius)/2
	drawFreeSpot(col*cell_size + spot_radius + d, row*cell_size + spot_radius + d, color, context);
}


function moveSpot(row1, col1, row2, col2, id){
		active_x = col1*cell_size+ spot_radius;
		active_y = row1*cell_size+ spot_radius;
		dx = (col2-col1)*cell_size/10;
		dy = (row2-row1)*cell_size/10;
		counter = 10;
		moving_id = setInterval(drawMovingSpot,10)
		active_data = [row2, col2, id];
}

function drawMovingSpot(){
		context_front.clearRect(0, 0, field_width, field_height);
		var cl = (active_data[2] == PLAYER) ? P_COLOR : O_COLOR;
		drawFreeSpot(active_x, active_y, cl, context_front);
		active_x += dx;
		active_y += dy;
		if (counter-- <=0) {
			clearInterval(moving_id);
			onSpotStops();
		}
}

function drawFreeSpot(x, y, color, context = context_back){
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, spot_radius, 0, 2*Math.PI);
	context.fill();
}

function onSpotStops(){
		if (turn == OPPONENT){
			if (canMakeStep(PLAYER)) {
				timer = TIME_TO_STEP;
				turn = PLAYER
			}
			else{
				update_handler({message:"You cannot make step!"});
				turn = OPPONENT;
				setTimeout(makeStepOppenent, 700);
			}
		} else {
			turn  = OPPONENT;
			setTimeout(makeStepOppenent, 700);
		}
		if (active_data) checkNeighbours(active_data[0], active_data[1], active_data[2]);
		updateGameField();
}


// Initialization of empty field
function initEmptyField(){
	game_field = [];
	for (var i = 0; i<10; i++){
		game_field.push([]);
		for (var j = 0; j<10; j++){
			game_field[i].push(0);
			drawCell(i, j);
		}
	}
}

// Initialization of all sppots on the field
function initDefaultPoints(){
	var i,j;
	for (i = 0; i<=POINT_DEM; i++){
		for (j = 0; j<POINT_DEM-i; j++){
			drawPoint(j, i, P_COLOR);
			game_field[j][i] = 1;
		}
	}

	for (i = FIELD_SIZE - 1; i>=FIELD_SIZE-POINT_DEM; i--){
		for (j = 2*FIELD_SIZE-POINT_DEM-i-1; j<FIELD_SIZE; j++){
			drawPoint(j, i, O_COLOR);
			game_field[j][i] = 2;
		}
	}
}

// Mouse click handler
function clickHandler(e){
	if (turn != PLAYER) return;
	var px = e.pageX - e.target.offsetLeft;
	var py = e.pageY - e.target.offsetTop;
	var col = Math.floor(px/cell_size);
	var row = Math.floor(py/cell_size);
	var p = game_field[row][col];
    switch (p) {
    // click on player's spot
		case PLAYER:
			if (!active_spot) {
				active_spot = [row,col];
				drawSpot(row, col, P_COLOR_A);
			}
			else if (active_spot[0] == row && active_spot[1] == col){
					active_spot = null;
					drawSpot(row, col, (active_spot)?P_COLOR_A:P_COLOR);
				}else{
					drawSpot(active_spot[0], active_spot[1], P_COLOR);
					active_spot[0] = row;
					active_spot[1] = col;
					drawSpot(row, col, P_COLOR_A);
				}
            break;
        // click on empty cell
		case EMPTY:
			if (!tryToMakeStep(row, col))
			 		update_handler({message:"You cannot go there"});
			break;
	}
}

// Check if it's possible to make step in [col, row] cell
function tryToMakeStep(row, col){
	if (!active_spot) return false;
	var dcol = col - active_spot[1];
	var drow = row - active_spot[0];
	var res = prossedStep(PLAYER, active_spot[0], active_spot[1] ,drow, dcol);
	if (res){
		active_spot = null;
		return true;
	}
	return false;
}

/** Spot can be move only to 8 neighbour cell or jump through one cell by diagonal, vertical or horizontal
 * |J| |J| |J|
 * | |M|M|M| |
 * |J|M|O|M|J|
 * | |M|M|M| |
 * |J| |J| |J|
 * */
function prossedStep(id, row, col, drow, dcol){
	if (Math.abs(dcol) <=1 && Math.abs(drow) <= 1){
		game_field[row+drow][col+dcol] = id;
		moveSpot(row, col, row+drow, col+dcol, id);
		//checkNeighbours(col+dcol, row+drow, id);
		return true;
	}else{
		if (Math.abs(dcol) == 2 && Math.abs(drow) == 2 || Math.abs(dcol) == 2 && drow == 0 || dcol == 0 && Math.abs(drow) == 2 ){
			game_field[row][col] = 0;
			updateGameField();
			moveSpot(row, col, row+drow, col+dcol, id);
			game_field[row+drow][col+dcol] = id;
		//checkNeighbours(col+dcol, row+drow, id);
			return true;
		}
	}
	return false;
}

// When step is done
function onStepMade() {
    if (turn == PLAYER) {
            turn = OPPONENT;
            setTimeout(makeStepOppenent, 700);
        } else {
            //turn = PLAYER;
    }
}

// Computer make step
function makeStepOppenent(){
	var step = calculateStepAI();
    if (step) {
        var res = prossedStep(OPPONENT, step[0], step[1], step[2][0], step[2][1]);
        if (res) {

        }
    		} else {
					turn = PLAYER;
        	timer = TIME_TO_STEP;
					update_handler({message:'Cannot find step!'});
        	updateGameField();
    }
}

// Convert neighbours to id
function checkNeighbours(row, col, id){
	console.log("check " ,row, col, id);
	if (row== undefined || col == undefined || id == undefined) return;
	for (var i = 0; i<NEIGHBOURS.length; i++){
		var nrow = row + NEIGHBOURS[i][0];
		var ncol = col + NEIGHBOURS[i][1];
		if (outOfRange(nrow, ncol)) continue;
		var value = game_field[nrow][ncol];
		if (value != id && value != EMPTY && value != DUMMY){
			game_field[nrow][ncol] = id;
		}
	}
}

// Calculation of the score for player with id
function getScore(id){
	var res = 0;
	for (var i = 0; i<row_count; i++)
		for (var j = 0; j<col_count; j++)
            if (game_field[i][j] == id) res++;
	return (res < 10) ? (' ' + res) : res;
}

// Checking if game is finished
function checkGameFinished() {
    if (getScore(PLAYER) == 0) return true;
    for (var i = 0; i < row_count; i++)
        for (var j = 0; j < col_count; j++)
            if (game_field[i][j] == EMPTY) return false;
    return true;
}

// ------------------ AI ------------------
/*
* Calculating the best step for computer
 * @return [col, row, [dcol, drow]]
*/
function calculateStepAI(){
	var cur_score = getScore(OPPONENT);

	var best_score = cur_score;
  var best_step = null;
	for (var i = 0; i<row_count; i++)
		for (var j = 0; j<col_count; j++){
			if (game_field[i][j] == OPPONENT){
				var step_res = bestStepForSpot(i,j);
				var d_score = step_res[1];
				if (step_res[0].length == 0) continue;
				if (cur_score + d_score >= best_score){
					best_score = cur_score + d_score;
					best_step = [i, j, step_res[0]];
				}
			}
		}

	return best_step;
}

// Coordinates are out of the field
function outOfRange(row, col){
	return (col<0 || row<0 || col>=col_count || row >= row_count);
}

function canMakeStep(player_id){
	for (var i = 0; i<row_count; i++)
		for (var j = 0; j<col_count; j++){
			if (game_field[i][j] == player_id){
				var cur_pos = [i,j];
				for (k = 0; k<POSSIBLE_MOVING.length; k++){
						var pos = [cur_pos[0] + POSSIBLE_MOVING[k][0], cur_pos[1] + POSSIBLE_MOVING[k][1]];
						if (outOfRange(pos[0], pos[1])) continue;
						if (game_field[pos[0]][pos[1]] == EMPTY) return true;
				}
			}
		}
	return false;
}

/*
* Best step for defined spot
 * @return [[drow, dcol], max_score]
*/
function bestStepForSpot(row, col){
	var cur_pos = [row, col];
	var j = 0;
	var pos  = [];
	var max_s = 0;
	var s_n = 0;
	var d_pos = [];
	for (j = 0; j<POSSIBLE_MOVING.length; j++){
		pos = [cur_pos[0] + POSSIBLE_MOVING[j][0], cur_pos[1] + POSSIBLE_MOVING[j][1]];
		if (outOfRange(pos[0], pos[1])) continue;
		if (game_field[pos[0]][pos[1]] == EMPTY){
			s_n = getScoreAfterStep(cur_pos, pos);
			if (s_n >= max_s){
				max_s = s_n;
				d_pos = [POSSIBLE_MOVING[j][0], POSSIBLE_MOVING[j][1]];
			}
		}
	}
	return [d_pos, max_s];
}

// Calculation score if specified step will be done
function getScoreAfterStep(cur_pos, new_pos){
	var res = 0;
	var map = arrayClone(game_field);
	if (Math.abs(new_pos[0] - cur_pos[0]) <=1 && Math.abs(new_pos[1] - cur_pos[1]) <= 1){
		map[new_pos[0]][new_pos[1]] = map[cur_pos[0]][cur_pos[1]] ;
		res++;
	}else{
		map[new_pos[0]][new_pos[1]] = map[cur_pos[0]][cur_pos[1]] ;
		map[cur_pos[0]][cur_pos[1]] = EMPTY;
	}
	for (var i = 0; i<NEIGHBOURS.length; i++){
		var p = [new_pos[0] + NEIGHBOURS[i][0], new_pos[1] + NEIGHBOURS[i][1]];
		if (outOfRange(p[0], p[1])) continue;
		if (map[p[0]][p[1]] == EMPTY || map[p[0]][p[1]] == DUMMY) continue;
		if(map[p[0]][p[1]] != map[new_pos[0]][new_pos[1]]){
			map[p[0]][p[1]] = map[new_pos[0]][new_pos[1]];
			res++;
		}
	}
	return res;
}

// Cloning array
function arrayClone(arr) {
	var i, copy;

	if (Array.isArray(arr)) {
		copy = arr.slice(0);
		for (i = 0; i < copy.length; i++) {
			copy[i] = arrayClone(copy[i]);
		}
		return copy;
	} else if(typeof arr === 'object') {
		throw 'Cannot clone array containing an object!';
	} else {
		return arr;
	}

}

// ------------------ constants ---------------

var NEIGHBOURS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
var POSSIBLE_MOVING =
	[[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1], [-2, -2], [0, -2], [2, -2], [-2, 0], [2, 0], [-2, 2], [0, 2], [2, 2]];

var LEVELS = [
	//
	[[ 1, 1, 1, 0,-1,-1, 0],
	 [ 1, 1,-1,-1,-1, 0, 0],
	 [ 1, 1,-1,-1,-1,-1, 0],
	 [-1,-1,-1, 0, 0, 0, 2],
	 [-1,-1,-1, 0,-1, 2, 2],
	 [ 0, 0,-1,-1, 2, 2, 2],
	],
	[[1,1,1,0,0,0,0],
	 [1,1,0,0,0,0,0],
	 [1,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,2],
	 [0,0,0,0,0,2,2],
	 [0,0,0,0,2,2,2],
	],
	//1-1
	[[1,1,1,0,0,0,0],
	 [1,1,0,0,0,0,0],
	 [1,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,2],
	 [0,0,0,0,0,2,2],
	 [0,0,0,0,2,2,2],
	],
	//2
	[[1,1,1,-1,-1,0,0,0],
	 [1,1,0,-1,-1,0,0,0],
	 [1,0,0,0,0,0,0,0],
	 [-1,-1,0,0,0,0,-1,-1],
	 [-1,-1,0,0,0,0,-1,-1],
	 [0,0,0,0,0,0,0,2],
	 [0,0,0,-1,-1,0,2,2],
	 [0,0,0,-1,-1,2,2,2],
	],
	//3
	[[1,1,1,-1,-1,0,0,0],
	 [1,-1,0,0,0,0,-1,0],
	 [1,0,-1,0,0,-1,0,0],
	 [-1,0,0,0,0,0,0,-1],
	 [-1,0,0,0,0,0,0,-1],
	 [0,0,-1,0,0,-1,0,2],
	 [0,-1,0,0,0,0,-1,2],
	 [0,0,0,-1,-1,2,2,2],
	],
	//4
	[[1,1,1,0,0,-1,0,0],
	 [1,1,0,0,-1,0,0,0],
	 [-1,0,0,-1,0,0,0,0],
	 [0,-1,0,-1,-1,-1,0,0],
	 [0,0,-1,-1,-1,0,-1,0],
	 [0,0,0,0,-1,0,0,-1],
	 [0,0,0,-1,0,0,2,2],
	 [0,0,-1,0,0,2,2,2],

    ],
    //5
	[
	 [1,1,0,0,0],
	 [1,0,0,0,0],
	 [0,0,0,0,2],
	 [0,0,0,2,2],
	],
];
