class SelectScreen extends Phaser.Scene {

	constructor() {
		super({ key: 'SelectScreen' });
	}

	preload(){
			//this.load.image('sky', 'https://s3.amazonaws.com/codecademy-content/courses/learn-phaser/sky.jpg');
			this.load.spritesheet('spotTile' , 'assets/spots1.png', { frameWidth: 60, frameHeight: 60 });
			this.load.image('btn', 'assets/ButtonArrowUpSprite.png');
	}

  create() {
		const screenControls = {};

		//this.add.image(200, 200, 'sky');
		let caption = this.add.text(100, 100, 'Click to Start!', {fontFamily: 'Verdana',fill: '#000000', fontSize: '40px'})

		/*gameState.exampleSprite = this.physics.add.sprite(100, 200, 'spotTile');
    this.anims.create({
      key: 'redToBlue',
      frames: this.anims.generateFrameNumbers('spotTile', { start: 0, end: 8 }),
      frameRate: 50,
      repeat: 0
    });
		gameState.exampleSprite.anims.play('redToBlue');*/

		screenControls.startBtn = this.createButton('btn', config.width/2, config.height/2);
		screenControls.startBtn.on('pointerup', ()=> {
					this.scene.stop('SelectScreen')
					this.scene.start('GameScreen')
		});
  }

	createButton(id, pos_x, pos_y){
		let res = this.add.sprite(pos_x, pos_y, id);
		res.setInteractive();
		return res;
	}
}
