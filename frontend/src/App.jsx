import axios from "axios";
import Routes from "./Routes";
import { UserContextProvider } from "./context/UserContext";

function App() {
  axios.defaults.baseURL = "https://texts-chat-app.onrender.com";
  axios.defaults.withCredentials = true;

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  );
}

export default App;
