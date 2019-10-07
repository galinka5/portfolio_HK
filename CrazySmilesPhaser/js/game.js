/**
 * Main class for game Spots
 *
 * @author Halyna Kyryliuk
 * */
const gameState = {
   score_p: 0,
	 score_o: 0
 };

 const config = {
   type: Phaser.AUTO,
   width: 500,
   height: 600,
   backgroundColor: "b9eaff",
	 physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
   scene: [SelectScreen, GameScreen]
 }

 const game = new Phaser.Game(config);
