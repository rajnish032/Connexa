import io from "socket.io-client";
import { BASE_URL } from "./constant";

let socketInstance = null;

export const createSocketConnection = () => {
  if (!socketInstance) {
    socketInstance = io(BASE_URL, {
      autoConnect: true,
      withCredentials: true,
    });
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};