// The environment variables the app reads (see .env.example and docs/DEPLOY.md).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Public URL of the Storage bucket with the can skins; empty = use public/cans/. */
  readonly VITE_SKIN_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
