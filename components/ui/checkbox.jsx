export function Checkbox({ checked, onCheckedChange }) {
    return (
      <input
        type="checkbox"
        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring focus:ring-blue-200"
        checked={checked}
        onChange={onCheckedChange}
      />
    );
  }
  