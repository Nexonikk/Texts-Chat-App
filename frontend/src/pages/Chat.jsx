import React, { useEffect, useContext, useState, useRef } from "react";
import { uniqBy } from "lodash";
import { IoSendSharp } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa6";
import Avatar from "../components/Avatar";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import Contact from "../components/Contact";
import classNames from "classnames";
import CustomScrollbar from "react-custom-scrollbar";
import axiosBaseService from "../utils/axiosBaseService";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [greating, setGreating] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const { username, id } = useContext(UserContext);
  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();

    return () => {
      ws?.close?.();
    };
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("reconnecting");
        connectToWs();
      }, 700);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};

    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    // console.log(people);
    setOnlinePeople(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    console.log({ e, messageData });
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
      // console.log(setMessages);
    }

    function getGreeting() {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        return "Good Morning,";
      } else if (hour >= 12 && hour < 17) {
        return "Good Afternoon,";
      } else if (hour >= 17 && hour < 20) {
        return "Good Evening,";
      } else {
        return "Good Night,";
      }
    }
    setGreating(getGreeting());
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    // console.log("sending");
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
      })
    );
    setNewMessageText("");
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recipient: selectedUserId,
        _id: Date.now(),
      },
    ]);
  }

  useEffect(() => {
    axiosBaseService.get("/people", {}).then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedUserId) {
      axiosBaseService
        .get("/messages/" + selectedUserId)
        .then((res) => setMessages(res.data));
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, "_id");
  console.log(offlinePeople, selectedUserId);
  console.log(Object.keys(offlinePeople));
  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={classNames(
          "bg-black bg-gradient-to-br w-screen from-sky-950 md:w-1/3 overflow-y-scroll pt-4 absolute md:relative h-screen md:h-full",
          selectedUserId ? "hidden md:block" : "block"
        )}
      >
        <div className="text-white pl-4 gap-2 mb-4 ml-4 border-b border-gray-300">
          <div className="text-gray-400">{greating}</div>
          <div className="text-2xl mb-2">{username}</div>
        </div>
        <div>
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => {
                setSelectedUserId(userId);
                console.log({ userId });
              }}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              _username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
      </div>
      {/* The GREAT WALL OF THE DIVISION BETWEEN RIGHT AND LEFT */}

      <div className="bg-black bg-gradient-to-tl from-sky-950 md:w-2/3 flex flex-col p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex opacity-0 md:opacity-100 h-full text-gray-400 items-center justify-center">
              Select a Person
            </div>
          )}
        </div>

        {/* -------------------PERSON NAME ------------------- */}

        {!!selectedUserId && (
          <div className="text-white p-4 rounded-2xl flex gap-3 bg-opacity-20 bg-slate-800">
            <FaArrowLeft
              className="text-lg mt-1"
              onClick={() => setSelectedUserId(null)}
            />
            {(onlinePeople[selectedUserId] && (
              <>
                <Avatar
                  online={onlinePeople[selectedUserId]}
                  username={onlinePeople[selectedUserId]}
                />
                <span className="text-xl pl-1">
                  {onlinePeople[selectedUserId]}
                </span>
              </>
            )) || (
              <>
                {Object.keys(offlinePeople)
                  .filter((people) => people === selectedUserId)
                  .map((selectedUserId) => (
                    <>
                      <Avatar
                        _username={offlinePeople[selectedUserId].username[0]}
                      />
                      <span className="text-xl pl-1">
                        {offlinePeople[selectedUserId].username}
                      </span>
                    </>
                  ))}
              </>
            )}
          </div>
        )}

        {/* -------------------CHAT PAGE------------------- */}

        {!!selectedUserId && (
          <div
            className={classNames(
              "relative h-full overflow-y-scroll",
              selectedUserId ? "w-screen md:w-full" : "w-full"
            )}
          >
            <CustomScrollbar style={{ height: "100%", width: "100%" }}>
              <div className="p-2">
                {messagesWithoutDupes.map((messages) => (
                  <div
                    key={messages._id}
                    className={
                      messages.sender === id ? "text-right" : "text-white"
                    }
                  >
                    <div
                      className={classNames(
                        "inline-block text-left p-3 m-2 max-w-64 md:max-w-lg rounded-2xl text-md break-all",
                        messages.sender === id
                          ? "bg-blue-500 bg-gradient-to-br from-cyan-400 text-white "
                          : "bg-slate-800 bg-opacity-70 text-white"
                      )}
                    >
                      {messages.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderMessages}></div>
              </div>
            </CustomScrollbar>
          </div>
        )}

        {/* -------------------SEND MESSAGE------------------- */}

        {!!selectedUserId && (
          <form className="flex" onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type="text"
              placeholder="  Type message..."
              className="bg-gray-700 outline-none flex-grow text-white rounded-full p-2 mx-2"
            />
            <button
              type="submit"
              className="bg-blue-500 bg-gradient-to-br from-cyan-400 p-3 mr-2 md:p-4 rounded-full text-white"
            >
              <IoSendSharp size={20} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
