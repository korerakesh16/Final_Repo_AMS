import React from 'react';

const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarStyle = () => {
  return 'bg-[#1E3A8A] text-white border-blue-900/20 shadow-blue-900/5';
};

const Avatar = ({ name, className = 'h-10 w-10 rounded-xl', textSize = 'text-xs' }) => {
  const initials = getInitials(name);
  const colorClass = getAvatarStyle(name);

  return (
    <div
      className={`${className} ${colorClass} border flex items-center justify-center font-bold tracking-wider select-none shrink-0 uppercase shadow-sm ${textSize}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
