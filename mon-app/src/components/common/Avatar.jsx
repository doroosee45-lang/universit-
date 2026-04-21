export default function Avatar({ name = "User" }) {
  return (
    <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}