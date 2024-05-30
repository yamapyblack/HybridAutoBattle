import { useWriteEndBattle } from "src/lib/hooks/useContractManager";

const ConfirmResult = ({
  onSuccess,
  onComplete,
  battleId,
  battleResult,
  signature,
}) => {
  /**============================
 * useState, useContext
 ============================*/
  const { hash, write, isLoading } = useWriteEndBattle(
    onSuccess,
    onComplete,
    battleId,
    battleResult,
    signature
  );

  /**============================
 * Rendering
 ============================*/
  return (
    <>
      <button
        className="bg-sub text-xl px-8 py-2 rounded-md text-decoration-none"
        onClick={() => {
          if (isLoading) return;
          write();
        }}
      >
        {isLoading ? "Loading..." : "CONFIRM"}
      </button>
    </>
  );
};

export default ConfirmResult;
