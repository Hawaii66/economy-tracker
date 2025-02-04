import { v4 as uuidv4 } from "uuid";

export const uuid = uuidv4;

export const filterNull = <T>(i: T | null): i is T => i !== null;
