import React from 'react';

export const Footer: React.FC = () => {
  return (
    <div className="mt-8 text-center text-sm text-gray-500">
      <p>© {new Date().getFullYear()} - Kullanım hakkı Kenan TÜRKÖZ'e aittir. Bu içeriğin izinsiz kopyalanması, dağıtılması veya ticari amaçlarla kullanılması yasaktır ve yasal işlem gerektirebilir.</p>
    </div>
  );
};