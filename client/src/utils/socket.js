import io from "socket.io-client";
import { BASE_URL } from "./constant";

let socketInstance = null;

export const createSocketConnection = () => {
  if (!socketInstance) {
    socketInstance = io(BASE_URL, {
      withCredentials: true,
      autoConnect: true,
    });
  }

  return socketInstance;
};