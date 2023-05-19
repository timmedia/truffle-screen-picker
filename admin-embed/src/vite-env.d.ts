/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_DATABASE_URL: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_TRUFFLE_VERSION: string;
  readonly VITE_FIREBASE_RESULTS_URL: string;
  readonly VITE_MYCELIUM_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
