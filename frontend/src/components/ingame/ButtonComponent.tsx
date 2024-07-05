const ButtonComponent = ({ isLoading, write, text }) => {
  /**============================
 * useState, useContext
 ============================*/

  /**============================
 * Rendering
 ============================*/
  return (
    <>
      <button
        className="text-2xl font-bold px-10 rounded-md border-2 border-white text-decoration-none hover:opacity-90"
        onClick={() => {
          if (isLoading) return;
          write();
        }}
      >
        {isLoading ? "Loading..." : text}
      </button>
    </>
  );
};

export default ButtonComponent;
