import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  return (
    <div>
      <Login onLogin={() => setLoggedIn(true)} />
    </div>
  );
}

export default App;
