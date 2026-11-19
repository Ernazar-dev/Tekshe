/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API mánzili. Bos bolsa — `/api` (Vite proxy yamasa bir domen) */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
