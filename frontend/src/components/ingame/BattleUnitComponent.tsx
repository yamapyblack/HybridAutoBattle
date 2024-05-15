import { useContext } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { type Unit, type UnitVariable } from "src/lib/interfaces/interface";

interface UnitComponentProps {
  isPlayer: boolean;
  index: number;
  unit?: Unit;
  unitVariable?: UnitVariable;
  resetIsAnimation: () => void;
}

const BattleUnitComponent = ({
  isPlayer,
  index,
  unit,
  unitVariable,
  resetIsAnimation,
}: UnitComponentProps) => {
  if (!unit || !unitVariable) return;

  const unitImageSize = 68;
  const attackImageSize = 28;
  const lifeImageSize = 28;
  const width = "w-8";

  return (
    <>
      <motion.div
        initial={{ y: 0 }}
        animate={unitVariable.isAnimateAttacking ? { y: -20 } : {}}
        transition={{
          repeatType: "mirror",
          repeat: 1,
          duration: 0.16,
          type: "spring",
        }}
        onAnimationComplete={() => {
          resetIsAnimation();
        }}
      >
        <Image
          src={`/images/cards/${unit.imagePath}.png`}
          alt=""
          width={unitImageSize}
          height={16}
        />
      </motion.div>
      <div className="flex justify-between">
        <div className={`${width} relative`}>
          <Image
            src="/images/common/attack.png"
            alt=""
            width={attackImageSize}
            height={attackImageSize}
          />
          <NumberComponent
            index={index}
            value={unitVariable.attack}
            isAnimate={unitVariable.isAnimateChangeAttack}
            resetIsAnimation={resetIsAnimation}
          />
        </div>
        <div className={`${width} relative`}>
          <Image
            src="/images/common/life.png"
            alt=""
            width={lifeImageSize}
            height={lifeImageSize}
          />
          <NumberComponent
            index={index}
            value={unitVariable.life}
            isAnimate={unitVariable.isAnimateChangeLife}
            resetIsAnimation={resetIsAnimation}
          />
        </div>
      </div>
    </>
  );
};

const NumberComponent = ({ index, value, isAnimate, resetIsAnimation }) => {
  const cellWidth = 24;

  return (
    <motion.div
      style={{
        position: "absolute",
        left: 2,
        top: 3,
      }}
      initial={{ width: cellWidth, x: 0, y: 0 }}
      animate={
        isAnimate
          ? {
              width: cellWidth * 2,
              x: -cellWidth / 2,
              y: -cellWidth / 2,
            }
          : {}
      }
      transition={{
        repeatType: "mirror",
        repeat: 1,
        duration: 0.2,
        type: "spring",
      }}
      onAnimationComplete={() => {
        // console.log("Animation completed");
        resetIsAnimation();
      }}
    >
      <Image
        src={`/images/common/numbers/${value}.png`}
        alt=""
        width={100}
        height={100}
      />
    </motion.div>
  );
};

export default BattleUnitComponent;
