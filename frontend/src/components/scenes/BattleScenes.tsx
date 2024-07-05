import Head from "next/head";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import TitleComponent from "src/components/ingame/TitleComponent";

const DynamicComponentWithNoSSR = dynamic(
  () => import("src/phaser/PhaserConfig"),
  {
    ssr: false,
  }
);

const BattleScenes = ({ setScene, setResult, battleId, stage }) => {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Add this line

  useEffect(() => {
    setLoading(true);
    setIsClient(true); // Add this line
  }, []);

  return (
    <div>
      <Head>
        <title></title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {isClient ? (
        <div>
          <div key={Math.random()} id="game"></div>
          <div>
            {loading ? (
              <DynamicComponentWithNoSSR
                setScene={setScene}
                setResult={setResult}
                battleId={battleId}
                stage={stage}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <TitleComponent />
      )}
    </div>
  );
};

export default BattleScenes;
