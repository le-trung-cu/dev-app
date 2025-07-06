import {useQueryState, parseAsString} from "nuqs";

export const useThreadId = () => useQueryState("threadId", parseAsString.withDefault(""));