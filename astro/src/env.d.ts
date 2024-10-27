// @root/astro/src/env.d.ts

/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CLIENT_ID: string
  readonly CLIENT_SECRET: string
  readonly BASE_URL: string
  readonly MONGO_CONNECTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

