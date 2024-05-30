import { useEffect, useState } from "react";
import Image from "next/image";
import { useReadPlayerStage } from "src/lib/hooks/useContractManager";
import { clearStorage } from "src/lib/utils/debugStorage";

interface HeaderComponent {
  onStageChange?: (stage: number) => void;
}

const HeaderComponent = ({ onStageChange }) => {
  const [stage, setStage] = useState(-1);
  const playerStage = useReadPlayerStage();

  //Set stage by contract data
  useEffect(() => {
    if (playerStage !== undefined) {
      setStage(Number(playerStage));
      if (onStageChange) {
        onStageChange(Number(playerStage));
      }
    }
  }, [playerStage, onStageChange]);

  return (
    <header className="p-2 w-3/4">
      <div className="flex justify-between items-center w-20 rounded-md bg-darkgray mt-4 pl-2 pr-2">
        {/* TODO review this */}
        {/* <Image src="/images/edit/stage.png" alt="" width={16} height={16} />
        <div className="text-lg font-bold">{stage}</div> */}
      </div>
      {process.env.NEXT_PUBLIC_DEBUG_MODE === "true" && (
        <button onClick={clearStorage}>Clear Local Storage</button>
      )}
    </header>
  );
};

export default HeaderComponent;
