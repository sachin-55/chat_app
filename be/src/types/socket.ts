import { IUser } from "@/database/interface/user";
import { Socket } from "socket.io";

export interface IExtendedSocket extends Socket {
  data: {
    user?: IUser;
  };
}
