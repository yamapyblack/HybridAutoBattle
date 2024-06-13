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
        className="bg-btn text-md font-bold text-btntext px-9 py-2 rounded-md text-decoration-none hover:opacity-90"
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
