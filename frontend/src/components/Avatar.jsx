import React from "react";

const Avatar = ({ username, _username, online }) => {
  return (
    <div
      className={"w-8 h-8 relative rounded-full bg-slate-200 flex items-center"}
    >
      <div className="text-center text-gray-700  w-full">
        {online ? username[0] : _username[0]}
        {/* {username[0]} */}
      </div>
      {online && (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
};

export default Avatar;
