class GameScreen extends Phaser.Scene {
	constructor() {
		super({ key: 'GameScreen' });
		this.screenControls = {};
		this.TIME_TO_STEP = 10;
		this.CELL_SIZE = 60;
		this.gameTimer = this.TIME_TO_STEP;
		this.NEIGHBOURS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
		this.POSSIBLE_MOVING =
			[[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1], [-2, -2], [0, -2], [2, -2], [-2, 0], [2, 0], [-2, 2], [0, 2], [2, 2]];

		this.LEVELS =
	     [
				 //0
	      [[1,1,1,0,0,0,0],
	       [1,1,0,0,0,0,0],
	       [1,0,0,0,0,0,0],
	       [0,0,0,0,0,0,0],
	       [0,0,0,0,0,0,2],
	       [0,0,0,0,0,2,2],
	       [0,0,0,0,2,2,2],
	      ],
	      //1
	      [[1,1,1,-1,-1,0,0,0],
	       [1,1,0,-1,-1,0,0,0],
	       [1,0,0,0,0,0,0,0],
	       [-1,-1,0,0,0,0,-1,-1],
	       [-1,-1,0,0,0,0,-1,-1],
	       [0,0,0,0,0,0,0,2],
	       [0,0,0,-1,-1,0,2,2],
	       [0,0,0,-1,-1,2,2,2],
	      ],
	      //2
	      [[1,1,1,-1,-1,0,0,0],
	       [1,-1,0,0,0,0,-1,0],
	       [1,0,-1,0,0,-1,0,0],
	       [-1,0,0,0,0,0,0,-1],
	       [-1,0,0,0,0,0,0,-1],
	       [0,0,-1,0,0,-1,0,2],
	       [0,-1,0,0,0,0,-1,2],
	       [0,0,0,-1,-1,2,2,2],
	      ],
	      //3
	      [[1,1,1,0,0,-1,0,0],
	       [1,1,0,0,-1,0,0,0],
	       [-1,0,0,-1,0,0,0,0],
	       [0,-1,0,-1,-1,-1,0,0],
	       [0,0,-1,-1,-1,0,-1,0],
	       [0,0,0,0,-1,0,0,-1],
	       [0,0,0,-1,0,0,2,2],
	       [0,0,-1,0,0,2,2,2],
	      ],
	        //4
	      [
	       [1,1,-1,-1,0],
	       [1,-1,-1,0,0],
	       [0,-1,-1,0,2],
	       [0,-1,-1,2,2],
	      ],
	    ]
		this.RESULT_TEXTS = ['You lost!','There is a draw!','You win!'];

		this.level;
		this.game_field = [];
		this.activeSpot = null;

		this.CODES = {EMPTY : 0, PLAYER : 1, OPPONENT : 2, DUMMY : -1};
		this.turn = this.CODES.PLAYER;
		this.enabled = true;
		this.scores = {player:0, opponent: 0};
	}

  preload(){
		this.load.image('cell', 'assets/cell.png');
		this.load.image('cell1', 'assets/cell1.png');
		this.load.spritesheet('spotTile' , 'assets/spots3.png', { frameWidth: 60, frameHeight: 60 });
	}

  create() {
		this.initControls();
		this.initTimer();
		this.initGameField(0);
		this.updateScore();
  }

	update(){

	}

	initControls(){
		let rects = [
			this.add.rectangle(20, 20, 100, 50, 0xffffff),
			this.add.rectangle(380, 20, 100, 50, 0xffffff),
			this.add.rectangle(175, 20, 150, 50, 0xffffff),
		];
		for (let rect of rects) {
			rect.setOrigin(0,0);
		}

		let textStyle = {
			fontFamily: 'monospace',
		  fill: '#000000',
		  fontSize: '50px',
			align: 'center',
		};

		this.screenControls.timer = this.add.text(180, 20, '00:10', textStyle);

		textStyle.fill = '#ff0000';
		this.screenControls.playerScore = this.add.text(40, 20, '10', textStyle);

		textStyle.fill = '#00ff';
		this.screenControls.opponentScore = this.add.text(455, 20, '10', textStyle).setOrigin(1,0);

		textStyle.fill = '#ddff00';
		this.screenControls.infoText = this.add.text(150, config.height/2-50, 'Some Text', textStyle);
		this.screenControls.infoText.visible = false;
		this.screenControls.infoText.setShadow(5, 5, '#333333', 5, true, true);
	}

	showGameMessage(str, callback, ms = 1000){
		this.screenControls.infoText.text = str;
		this.screenControls.infoText.visible = true;
		this.screenControls.infoText.x = (config.width - this.screenControls.infoText.width) / 2;
		console.log("callback = ", callback);

		setTimeout(()=>{
			this.screenControls.infoText.visible = false;
			if (callback) callback();
		}, ms);
	}

	initTimer(){
		this.timer = this.time.addEvent({
    	delay: 1000,
    	callback: this.onTimer,
			callbackScope: this,
    	loop: true
		});
		this.gameTimer = this.TIME_TO_STEP;
	}

	onTimer(){
		let ts = Math.floor(this.gameTimer % 60);
		let tm = Math.floor(this.gameTimer / 60);
		this.screenControls.timer.text = ((tm<10)? ("0"+tm.toString()) : tm.toString()) +
		":" + ((ts<10)? ("0"+ts.toString()) : ts.toString());
		if (this.gameTimer-- <= 0) this.missStep();
		if (this.checkGameFinished()) {
				this.timer.remove();
				this.showGameMessage(this.RESULT_TEXTS[Math.sign(this.scores.player - this.scores.opponent) + 1],
					()=>{this.restartGame()}, 2000);
	  }
	}

	restartGame(){
		console.log("RESTART ",this.spots);
		this.scores = {player:0, opponent: 0};

		this.spots.clear(true, true);

		if (this.level == -1){
			this.initDefaultGameField(4);
		}	else {
			this.game_field = this.cloneArray(this.LEVELS[this.level]);
		}

		this.initSpots();
		this.screenControls.infoText.setDepth(100);
		this.turn = this.CODES.PLAYER;

		this.initTimer();
		this.updateScore();
	}

	// If player miss step
	missStep(){
		this.showGameMessage('Miss Step!');
		this.opponentGo();
	}

	opponentGo(){
		console.log("opponentGo ", this.canMakeStep(this.CODES.OPPONENT));
		if (this.checkGameFinished()) return;
		if (!this.canMakeStep(this.CODES.OPPONENT)){
			this.showGameMessage('I have no step :(');
			this.playerGo();
			return;
		}
		if (this.activeSpot) this.activeSpot.setScale(1);
		this.gameTimer = this.TIME_TO_STEP;
		this.turn = this.CODES.OPPONENT;
		setTimeout(() => {this.makeStepOppenent();}, 1500);
	}

	initGameField(lvl){
		this.level = lvl;
		if (lvl == -1){
			this.initDefaultGameField(4);
		}	else {
			this.game_field = this.cloneArray(this.LEVELS[this.level]);
		}
		this.field_container = this.add.container(70, 120);
		this.spots = this.add.group();
		this.drawGameField();
		this.initSpots();
		this.screenControls.infoText.setDepth(100);
		this.turn = this.CODES.PLAYER;
	}

	drawGameField(){
		this.spots = this.add.group();
		let rc = this.getRowCount(), cc = this.getColCount();
		for (let i = 0; i<rc; i++){
			for (let j = 0; j<cc; j++){
						this.drawCell(i, j, this.game_field[i][j] == this.CODES.DUMMY);
			}
		}
	}

	initSpots(){
		let rc = this.getRowCount(), cc = this.getColCount();
		for (let i = 0; i<rc; i++){
			for (let j = 0; j<cc; j++){
				switch (this.game_field[i][j]){
					case this.CODES.PLAYER:
					case this.CODES.OPPONENT:
						this.addSpot(i, j, this.game_field[i][j]);
						break;
				}
			}
		}
	}

	drawCell(row, col, fill){
		let cell_img = this.add.image(col*this.CELL_SIZE, row*this.CELL_SIZE, fill ? 'cell1' : 'cell');
		this.field_container.add(cell_img);
		if (!fill){
			cell_img.setInteractive();
			var self = this;
			cell_img.on('pointerup', function(){
				self.onCellSelect(row, col)
			});
		}
	}

	onCellSelect(row, col){
		if (!this.enabled || this.turn == this.CODES.OPPONENT) return;
		if (!this.tryToMakeStep(row, col)) {
				this.showGameMessage('Oops!');
			}
		else{
				this.opponentGo();
		}
	}

	// Draw spot of defined color
	addSpot(row, col, color){
		let frame = (color == this.CODES.PLAYER) ? 0 : 9;
		let spot = this.physics.add.sprite(col*this.CELL_SIZE, row*this.CELL_SIZE, 'spotTile', frame);
    this.anims.create({
      key: 'redToBlue',
      frames: this.anims.generateFrameNumbers('spotTile', { start: 0, end: 8 }),
      frameRate: 50,
      repeat: 0
    });
		this.anims.create({
      key: 'blueToRed',
      frames: this.anims.generateFrameNumbers('spotTile', { start: 9, end: 17 }),
      frameRate: 50,
      repeat: 0
    });

		if (color == this.CODES.PLAYER) {
			spot.setInteractive();
			this.scores.player++;
		}else{
			this.scores.opponent++;
		}
		this.field_container.add(spot);
		this.spots.add(spot);
		/** for IE 11 */
		var self = this;
		spot.row = row;
		spot.col = col;
		spot.on('pointerup', function(event){
			self.onSpotSelect(spot);
		});
		this.spots.add(spot);
	}

	onSpotSelect(spot){
		if (!this.enabled || this.turn == this.CODES.OPPONENT) return;
	  if (this.activeSpot != null) {
			this.activeSpot.setScale(1);
		}
		if (spot == this.activeSpot){
				this.activeSpot = null;
			}else{
				this.activeSpot = spot;
				this.activeSpot.setScale(1.15);
			}
	}

	// Check if it's possible to make step in [col, row] cell
	tryToMakeStep(row, col){
		if (!this.activeSpot) return false;
		if (this.game_field[row][col] == this.CODES.OPPONENT) return false;
		let dcol = col - this.activeSpot.col;
		let drow = row - this.activeSpot.row;
		let res = this.prossedStep(this.CODES.PLAYER, this.activeSpot.row, this.activeSpot.col ,drow, dcol);
		if (res){
			this.activeSpot = null;
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
	prossedStep(id, row, col, drow, dcol){
		if (Math.abs(dcol) <=1 && Math.abs(drow) <= 1){
			this.game_field[row+drow][col+dcol] = id;
			this.addSpot(row, col, this.game_field[row][col]);
			this.moveSpot(row, col, row+drow, col+dcol, id);
			return true;
		}else{
			if (Math.abs(dcol) == 2 && Math.abs(drow) == 2 || Math.abs(dcol) == 2 && drow == 0 || dcol == 0 && Math.abs(drow) == 2 ){
				this.game_field[row][col] = 0;
				this.moveSpot(row, col, row+drow, col+dcol, id);
				this.game_field[row+drow][col+dcol] = id;
				return true;
			}
		}
		return false;
	}

	moveSpot(row1, col1, row2, col2, id){
			let dx = col2 - col1;
			let dy = row2 - row1;
			this.activeSpot.setScale(1);
			this.activeSpot.col = col2;
			this.activeSpot.row = row2;
			this.activeSpot.setDepth(99);
			this.enabled = false;
			let newMovement = this.tweens.add({
        	targets: this.activeSpot,
        	x: col2*this.CELL_SIZE,
					y: row2*this.CELL_SIZE,
        	duration: 200,
        	onComplete: ()=> {
						this.enabled = true;
						this.activeSpot = null;
						this.checkNeighbours(row2, col2, id);
					}
    	});
	}

	checkNeighbours(row, col, id){
		if (row == undefined || col == undefined || id == undefined) return;
		for (let i = 0; i<this.NEIGHBOURS.length; i++){
			let nrow = row + this.NEIGHBOURS[i][0];
			let ncol = col + this.NEIGHBOURS[i][1];
			if (this.outOfRange({row:nrow, col:ncol})) continue;
			let value = this.game_field[nrow][ncol];
			if (value != id && value != this.CODES.EMPTY && value != this.CODES.DUMMY){
				this.game_field[nrow][ncol] = id;
				let sp = this.getSpotAt(nrow, ncol);
				if (sp) {
					if (id == this.CODES.PLAYER) this.convertSpotToPlayer(sp);
					if (id == this.CODES.OPPONENT) this.convertSpotToOpponent(sp);
				}
			}
		}
		this.updateScore();
	}

	updateScore(){
		this.screenControls.playerScore.text = this.scores.player;
		this.screenControls.opponentScore.text = this.scores.opponent;
	}

	getSpotAt(row, col){
		let spots = this.spots.getChildren();
		for (let sp of spots){
				if (sp.col == col && sp.row == row) return sp;
		}
		return null;
	}

	convertSpotToPlayer(spot){
		spot.anims.play('blueToRed');
		spot.setInteractive();
		this.scores.opponent--;
		this.scores.player++;
	}

	convertSpotToOpponent(spot){
		spot.anims.play('redToBlue');
		spot.removeInteractive();
		this.scores.opponent++;
		this.scores.player--;
	}

	getRowCount(){
		return this.game_field.length;
	}

	getColCount(){
		return this.game_field[0].length;
	}

  /* position {row, col} */
	outOfRange(position){
		return (position.col<0 || position.row<0 || position.col>=this.getColCount() || position.row >= this.getRowCount());
	}

	// Initialization of all sppots on the field
	initDefaultGameField(fieldSize){
		this.game_field = [];
		let d = Math.round(fieldSize/2);
		for (let i = 0; i<fieldSize; i++){
			this.game_field.push([]);
			for (let j = 0; j<fieldSize; j++){
				this.game_field[i].push(this.CODES.EMPTY);
				if (i<=d && j<d-i){
					this.game_field[i][j] = this.CODES.PLAYER;
				}
			}
		}

		for (let i = fieldSize - 1; i>=fieldSize-d; i--){
			for (let j = 2*fieldSize-d-i-1; j<fieldSize; j++){
				this.game_field[j][i] = this.CODES.OPPONENT;
			}
		}
	}


	// Computer make step
	makeStepOppenent(){
		let step = this.calculateStepAI();
	    if (step) {
					this.activeSpot = this.getSpotAt(step.fromRow, step.fromCol);
	        let res = this.prossedStep(this.CODES.OPPONENT, step.fromRow, step.fromCol, step.toRow, step.toCol);
	        if (res) {
						this.playerGo();
	        }
	    } else {
				showGameMessage('Cannot find step!');
	      this.playerGo();
	    }
	}

	playerGo(){
		//if (this.checkGameFinished()) return;
		console.log("playerGo ", this.canMakeStep(this.CODES.PLAYER));
		if (this.canMakeStep(this.CODES.PLAYER)) {
				this.gameTimer = this.TIME_TO_STEP;
				this.turn = this.CODES.PLAYER
		}else{
			this.showGameMessage("You cannot\nmake step!");
			this.opponentGo();
		}
	}

	// ------------------ AI ------------------
	/*
	* Calculating the best step for computer
	 * @return [col, row, [dcol, drow]]
	*/
	calculateStepAI(){
		let row_count = this.getRowCount();
		let col_count = this.getColCount();
		let cur_score = this.scores.opponent;
	  let best_score = cur_score;
	  let best_step = {};
		for (let i = 0; i<row_count; i++)
			for (let j = 0; j<col_count; j++){
				if (this.game_field[i][j] == this.CODES.OPPONENT){
					let step_res = this.bestStepForSpot({row:i, col:j});
					let d_score = step_res.score;
					if (step_res.row == undefined) continue;
					if (cur_score + d_score >= best_score){
						best_score = cur_score + d_score;
						best_step = {fromRow:i, fromCol:j, toRow: step_res.row, toCol: step_res.col};
					}
				}
			}
		return best_step;
	}

	canMakeStep(player_id){
		let row_count = this.getRowCount();
		let col_count = this.getColCount();
		for (let i = 0; i<row_count; i++)
			for (let j = 0; j<col_count; j++){
				if (this.game_field[i][j] == player_id){
					let cur_pos = {row:i, col:j};
					for (let k = 0; k<this.POSSIBLE_MOVING.length; k++){
							let pos = {row: cur_pos.row + this.POSSIBLE_MOVING[k][0], col:cur_pos.col + this.POSSIBLE_MOVING[k][1]};
							if (this.outOfRange(pos)) continue;
							if (this.game_field[pos.row][pos.col] == this.CODES.EMPTY) return true;
					}
				}
			}
		return false;
	}

	/*
	* Best step for defined spot
	 * @return {row: drow, col: dcol, score: max_score}
	*/
	bestStepForSpot(position){
		let cur_pos = {row:position.row, col:position.col};
		let max_s = 0;
		let s_n = 0;
		let n_pos = {row: undefined, col:undefined};
		for (let j = 0; j<this.POSSIBLE_MOVING.length; j++){
			let pos = {row :+cur_pos.row + this.POSSIBLE_MOVING[j][0],
								 col: +cur_pos.col + this.POSSIBLE_MOVING[j][1]
							 };
			if (this.outOfRange(pos)) continue;
			if (this.game_field[pos.row][pos.col] == this.CODES.EMPTY){
				s_n = this.getScoreAfterStep(cur_pos, pos);
				if (s_n >= max_s){
					max_s = s_n;
					n_pos = {row: this.POSSIBLE_MOVING[j][0], col:this.POSSIBLE_MOVING[j][1]};
				}
			}
		}
		n_pos.score = max_s;
		return n_pos;
	}

	// Calculation score if specified step will be done
	getScoreAfterStep(cur_pos, new_pos){
		let res = 0;
		let map = this.cloneArray(this.game_field);
		if (Math.abs(new_pos.row - cur_pos.row) <=1 && Math.abs(new_pos.col - cur_pos.col) <= 1){
			map[new_pos.row][new_pos.col] = map[cur_pos.row][cur_pos.col] ;
			res++;
		}else{
			map[new_pos.row][new_pos.col] = map[cur_pos.row][cur_pos.col] ;
			map[cur_pos.row][cur_pos.col] = this.CODES.EMPTY;
		}
		for (let i = 0; i<this.NEIGHBOURS.length; i++){
			let p = {row: new_pos.row + this.NEIGHBOURS[i][0], col: new_pos.col + this.NEIGHBOURS[i][1]};
			if (this.outOfRange(p)) continue;
			if (map[p.row][p.col] == this.CODES.EMPTY || map[p.row][p.col] == this.CODES.DUMMY) continue;
			if(map[p.row][p.col] != map[new_pos.row][new_pos.col]){
				map[p.row][p.col] = map[new_pos.row][new_pos.col];
				res++;
			}
		}
		return res;
	}

	// Checking if game is finished
	checkGameFinished() {
	    if (this.scores.player == 0 || this.scores.opponent == 0) return true;
			let row_count = this.getRowCount();
			let col_count = this.getColCount();
	    for (let i = 0; i < row_count; i++)
	        for (let j = 0; j < col_count; j++)
	            if (this.game_field[i][j] == this.CODES.EMPTY) return false;
	    return true;
	}

	// Cloning array
	cloneArray (arr){
		let i, copy;
		if (Array.isArray(arr)) {
			copy = arr.slice(0);
			for (i = 0; i < copy.length; i++) {
				copy[i] = this.cloneArray(copy[i]);
			}
			return copy;
		} else if(typeof arr === 'object') {
			throw 'Cannot clone array containing an object!';
		} else {
			return arr;
		}
	}
}
