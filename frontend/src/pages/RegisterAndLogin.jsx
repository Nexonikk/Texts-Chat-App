import axios from "axios";
import React, { useContext, useState, useRef } from "react";
import { UserContext } from "../context/UserContext";
import TextLogo from "../assets/Text-logo.png";

const RegisterAndLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(e) {
    e.preventDefault();
    const url = isLoginOrRegister === "register" ? "/register" : "/login";

    try {
      const { data } = await axios.post(url, { username, password });
      setLoggedInUsername(username);
      setId(data.id);
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        console.error("Network error:", error.message);
      } else {
        console.error("Error:", error.message);
      }
    }
  }

  return (
    <>
      <div className="bg-gradient-to-br from-black bg-cyan-950 backdrop-blur-lg h-screen flex items-center">
        <div className="w-32 mb-24 md:mb-0 -mt-96 md:-mt-96 pb-60 absolute flex">
          <img src={TextLogo} alt="Text Logo" />
          {/* <h1 className="text-white absolute mt-8 mx-24 text-2xl font-serif">
            Text
          </h1> */}
        </div>
        <div className="w-10/12 md:w-3/12 h-auto bg-black bg-opacity-40 mx-auto">
          <form className="grid p-4 " onSubmit={handleSubmit}>
            <h1 className="text-2xl text-white font-bold p-2 ">
              {isLoginOrRegister === "register" ? "Register" : "Login"}
            </h1>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="p-4 my-4 text-white bg-black bg-opacity-85  ounded-lg"
            />
            <input
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="p-4 my-4 text-white bg-black bg-opacity-85 rounded-lg"
            />
            {/* <span
            className="fixed cursor-pointer p-44 mx-36"
            onClick={() => setShowPassword((prev) => !prev)}
            >
            {showPassword ? (
              <MdOutlineVisibility color="white" size={20} />
              ) : (
                <MdOutlineVisibilityOff color="white" />
                )}
                </span> */}

            <button className="text-white p-4 my-4 bg-blue-500 bg-gradient-to-br from-cyan-400 rounded-lg">
              {isLoginOrRegister === "register" ? "Register" : "Login"}
            </button>
            <div className="text-white p-2">
              {isLoginOrRegister === "register" && (
                <div>
                  Already Registered?{" "}
                  <button
                    onClick={() => setIsLoginOrRegister("login")}
                    className="text-white font-bold"
                  >
                    Login here
                  </button>
                </div>
              )}
              {isLoginOrRegister === "login" && (
                <div>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setIsLoginOrRegister("register")}
                    className="text-white font-bold"
                  >
                    Register here
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterAndLogin;
