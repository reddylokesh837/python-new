import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMsg(data.msg));
  }, []);

  return (
    <div>
      <h1>Fullstack Python App</h1>
      <p>{msg}</p>
    </div>
  );
}

export default App;
