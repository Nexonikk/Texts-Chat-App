import React from "react";
import Avatar from "./Avatar";

const Contact = ({ id, username, _username, onClick, selected, online }) => {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={
        "border-b border-gray-700 py-4 bg-blur flex hover:bg-slate-700 transition-all ease-in text-white" +
        (selected ? "border-2 border-cyan-400 text-white" : "")
      }
    >
      {selected && <div className="w-1 bg-white h-10"></div>}
      <div className="flex items-center gap-2 mx-4 pl-3">
        <Avatar
          online={online}
          _username={_username}
          username={username}
          userId={id}
        />
        <span className=" text-lg">{username}</span>
      </div>
    </div>
  );
};

export default Contact;
