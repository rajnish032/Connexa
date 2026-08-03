import io from "socket.io-client";
import { BASE_URL } from "./constant";

let socketInstance = null;

export const createSocketConnection = () => {
  if (!socketInstance) {
    if (location.hostname === "localhost") {
      socketInstance = io(BASE_URL, {
        autoConnect: true,
      });
    } else {
      socketInstance = io("/", {
        path: "/api/socket.io",
        autoConnect: true,
      });
    }
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};