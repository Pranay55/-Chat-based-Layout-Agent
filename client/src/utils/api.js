import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001",
});

export async function sendChatMessage(payload) {
  const res = await API.post("/api/chat", payload);
  return res.data;
}