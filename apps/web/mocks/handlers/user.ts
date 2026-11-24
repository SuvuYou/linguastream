import { getCurrentUserRoute } from "@linguastream/contracts";
import { mockUser } from "../fixtures/user";
import { mockRoute } from "../mockRoute";

export const userHandlers = [mockRoute(getCurrentUserRoute, mockUser)];
