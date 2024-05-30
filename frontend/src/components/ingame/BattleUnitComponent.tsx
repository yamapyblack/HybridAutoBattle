import { useEffect } from "react";
import Image from "next/image";
import { useAnimate } from "framer-motion";
import { type Unit, type UnitVariable } from "src/lib/interfaces/interface";

interface UnitComponentProps {
  index: number;
  unit?: Unit;
  unitVariable?: UnitVariable;
}

const BattleUnitComponent = ({ unit, unitVariable }: UnitComponentProps) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const doAnimate = async () => {
      await animate(scope.current, { y: -20 }, { duration: 0.1 });
      await animate(scope.current, { y: 0 }, { duration: 0.1 });
      await animate(scope.current, { y: -20 }, { duration: 0.1 });
      await animate(scope.current, { y: 0 }, { duration: 0.1 });
      unitVariable!.isAnimateAttacking = false;
    };
    if (unitVariable!.isAnimateAttacking) {
      doAnimate();
    }
  }, [unitVariable, animate, scope]);

  if (!unit || !unitVariable) return;

  return (
    <>
      <div ref={scope}>
        <Image
          src={`/images/cards/${unit.imagePath}.png`}
          alt=""
          width={84}
          height={16}
        />
      </div>
      <div className="flex justify-between">
        <div className={`w-8 relative`}>
          <Image
            src="/images/common/attack.png"
            alt=""
            width={36}
            height={36}
          />
          <NumberComponent
            value={unitVariable.attack}
            isAnimate={unitVariable.isAnimateChangeAttack}
            resetIsAnimation={() => {
              unitVariable.isAnimateChangeAttack = false;
            }}
          />
        </div>
        <div className={`w-8 relative`}>
          <Image src="/images/common/life.png" alt="" width={36} height={36} />
          <NumberComponent
            value={unitVariable.life}
            isAnimate={unitVariable.isAnimateChangeLife}
            resetIsAnimation={() => {
              unitVariable.isAnimateChangeLife = false;
            }}
          />
        </div>
      </div>
    </>
  );
};

const NumberComponent = ({ value, isAnimate, resetIsAnimation }) => {
  const cellWidth = 32;
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const doAnimate = async () => {
      await animate(
        scope.current,
        { width: cellWidth * 3, x: -cellWidth, y: -cellWidth },
        { duration: 0.1 }
      );
      await animate(
        scope.current,
        { width: cellWidth, x: 0, y: 0 },
        { duration: 0.1 }
      );
      resetIsAnimation();
    };
    if (isAnimate) {
      doAnimate();
    }
  }, [isAnimate, animate, scope, resetIsAnimation]);

  return (
    <div
      ref={scope}
      style={{
        position: "absolute",
        left: 0,
        top: 2,
        width: cellWidth,
      }}
    >
      <Image
        src={`/images/common/numbers/${value}.png`}
        alt=""
        width={120}
        height={120}
      />
    </div>
  );
};

export default BattleUnitComponent;
