import { getWordDefinitionRoute } from "@linguastream/contracts";
import { mockWordDefinition } from "../fixtures/definition";
import { mockRoute } from "../mockRoute";

export const definitionHandlers = [mockRoute(getWordDefinitionRoute, mockWordDefinition)];
