import { useState } from "react";
import { type Unit } from "../lib/interfaces/interface";

const ApiTest = () => {
  const [apiResponse, setApiResponse] = useState("");

  return (
    <div>
      <button
        onClick={() => {
          console.log("action");
          // postBattleAllApi()
          //   .then((response) => {
          //     console.log("response", response);
          //     setApiResponse(JSON.stringify(response));
          //   })
          //   .catch((error) => console.error("Error:", error));
        }}
      >
        action
      </button>
      <div>{apiResponse}</div>
    </div>
  );
};

export default ApiTest;
