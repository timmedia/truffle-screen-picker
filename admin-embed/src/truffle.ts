import { getEmbed, initTruffleApp } from "@trufflehq/sdk";

export const truffle = initTruffleApp({
  url: import.meta.env.VITE_MYCELIUM_API_URL,
});
export const embed = getEmbed();
