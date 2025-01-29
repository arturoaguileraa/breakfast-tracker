export function DeleteButton({ onClick }) {
    return (
      <button
        onClick={onClick}
        className="bg-white-500 ml-3 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-lg border-2 border-red-700 transition duration-200"
      >
        ❌
      </button>
    );
  }
  