import React, { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMsg(data.msg));
  }, []);

  return (
    <div>
      <h1>Fullstack Python App by Lokesh Reddy Vakada</h1>
      <h1>{msg}</h1>
    </div>
  );
}

export default App;
