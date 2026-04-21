import React from "react";

export const EmptyState = ({
  title = "Aucune donnée",
  description = "Aucun élément à afficher pour le moment.",
  icon: Icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
      {Icon && <Icon size={40} className="mb-3 text-gray-400" />}
      
      <h3 className="text-lg font-semibold text-gray-700">
        {title}
      </h3>

      <p className="text-sm mt-1">{description}</p>
    </div>
  );
};