import { useEffect, useState } from "react";
import { useAnimate } from "framer-motion";
import Image from "next/image";
import { TUTORIAL } from "src/constants/interface";

const TutorialComponent = ({ isTutorial, tutorial, onComplete }) => {
  //For tutorial
  const [scope, animate] = useAnimate();
  const [showDiv, setShowDiv] = useState(true); // New state variable

  //For tutorial
  useEffect(() => {
    const doAnimateMoveSubUnit = async () => {
      await animate(scope.current, { opacity: 1 }, { duration: 0 });
      await animate(scope.current, { y: -240, x: -380 }, { duration: 0.8 });
      await animate(scope.current, { opacity: 0 }, { duration: 0.5 });
      setShowDiv(false);
      onComplete();
    };
    const doAnimateReverseUnit = async () => {
      await animate(scope.current, { opacity: 1 }, { duration: 0 });
      await animate(scope.current, { x: 100 }, { duration: 0.4 });
      await animate(scope.current, { opacity: 0 }, { duration: 0.5 });
      setShowDiv(false);
      onComplete();
    };
    if (isTutorial) {
      if (tutorial === TUTORIAL.MoveSubUnit) {
        doAnimateMoveSubUnit();
      } else if (tutorial === TUTORIAL.ReverseUnit) {
        doAnimateReverseUnit();
      }
    }
  }, [isTutorial, onComplete, animate, scope, tutorial]);

  return showDiv ? (
    <>
      {tutorial === TUTORIAL.MoveSubUnit && (
        <div ref={scope} className="absolute left-1/2 z-50">
          <div style={{ marginLeft: "120px", marginTop: "400px" }}>
            <Image
              src="/images/common/finger.png"
              alt=""
              width={100}
              height={100}
            />
          </div>
        </div>
      )}
      {tutorial === TUTORIAL.ReverseUnit && (
        <div ref={scope} className="absolute right-1/2 opacity-0 z-50">
          <div style={{ marginRight: "100px", marginTop: "170px" }}>
            <Image
              src="/images/common/finger.png"
              alt=""
              width={100}
              height={100}
            />
          </div>
        </div>
      )}
    </>
  ) : null;
};

export default TutorialComponent;
