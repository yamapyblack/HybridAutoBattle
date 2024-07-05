import "phaser";
import GameBattle from "src/phaser/core/BattlePhaserScene";
import { useEffect } from "react";
import { useConfig, useAccount } from "wagmi";

export default function PhaserConfig({ setScene, setResult, battleId, stage }) {
  const wagmiConfig = useConfig();
  const { address } = useAccount();

  useEffect(() => {
    loadGame();
  });

  const loadGame = async () => {
    if (typeof window !== "object") {
      return;
    }

    const config = {
      type: Phaser.AUTO,
      backgroundColor: 0x06330d,
      seed: [(Date.now() * Math.random()).toString()],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "phaser", // matches App.jsx
        width: "2720",
        height: "1560",
        orientation: Phaser.Scale.Orientation.PORTRAIT,
      },
      scene: [
        new GameBattle(
          setScene,
          setResult,
          battleId,
          stage,
          wagmiConfig,
          address
        ),
      ],
      pixelArt: true,
    };

    const game = new Phaser.Game(config);

    //TODO
    game.scale.on(Phaser.Scale.Events.ORIENTATION_CHANGE, (orientation) => {
      if (orientation === Phaser.Scale.Orientation.PORTRAIT) {
        // Resume the game or hide the warning message
        console.log("PORTRAIT");
      } else {
        // Pause the game and show a warning message asking the user to switch to portrait mode
        console.log("LANDSCAPE");
      }
    });
  };

  return null;
}
