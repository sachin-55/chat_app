import { config } from "@/config";
import { authenticateSocket } from "@/middlewares/authenticate";
import {
  chatHandlers,
  checkIfHasJoinedRoom,
  handleGetUserOnlineStatus,
  typingHandlers,
  updateUserOnlineStatus,
} from "@/services/socketServices";
import { IExtendedSocket } from "@/types/socket";
import { type Server as HttpServer } from "http";
import { Namespace, Server as SocketServer } from "socket.io";

export let mainNamespace: Namespace | null = null;

export const initSocket = (server: HttpServer) => {
  const socketIO = new SocketServer(server, {
    cors: {
      origin: config.ALLOWED_ORIGINS,
      credentials: true,
    },
  });

  mainNamespace = socketIO.of("/");

  mainNamespace.use(authenticateSocket).on("connection", async (socket) => {
    console.log("User connected :: ", socket.id);
    await handleNewConnection(socket);
  });
};

const handleNewConnection = async (socket: IExtendedSocket) => {
  const user = socket.data?.user;
  if (!user) {
    return;
  }
  const userId = user._id.toString();

  // Ensure the user is in their dedicated room (using userId as room name)
  if (!checkIfHasJoinedRoom(socket, userId)) {
    await socket.join(userId);
  }

  // Listen for requests to get the user online status
  socket.on("get-user-online-status", async (data) => {
    await handleGetUserOnlineStatus(socket, userId, data);
  });

  // Set up user status updates and heartbeat handling
  await updateUserOnlineStatus(socket, userId);
  await typingHandlers(socket, userId);
  await chatHandlers(socket, userId);
};
