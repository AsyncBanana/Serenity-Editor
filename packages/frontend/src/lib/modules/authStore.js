import { writable } from "svelte/store";

export const user = writable(null);
export const auth0Client = writable(null);