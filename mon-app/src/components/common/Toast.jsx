import React from "react";

export const Toast = ({ toasts = [] }) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg text-white shadow-md
            ${
              toast.type === "error"
                ? "bg-red-500"
                : "bg-green-500"
            }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};