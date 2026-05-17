import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

export async function sendChatMessage(payload) {
  const res = await API.post("/api/chat", payload);
  return res.data;
}