import { getEmbed, initTruffleApp } from "@trufflehq/sdk";

const apiUrl = import.meta.env.VITE_MYCELIUM_API_URL;

export const truffle = initTruffleApp({ url: apiUrl });
export const embed = getEmbed();
