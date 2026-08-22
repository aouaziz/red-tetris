import React, { useState, FormEvent } from "react";

const Home: React.FC = () => {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const r = room.trim();
    const n = name.trim();
    if (r && n) {
      window.location.hash = `#${r}/${n}`;
    }
  };

  return (
    <div className="home">
      <h1>Red Tetris</h1>
      <form className="join-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          maxLength={50}
          required
        />
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
        />
        <button className="btn btn-join" type="submit">
          Join
        </button>
      </form>
    </div>
  );
};

export default Home;
