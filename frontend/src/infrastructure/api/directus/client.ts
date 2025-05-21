import { authentication, createDirectus, rest } from "@directus/sdk";

const url = import.meta.env.VITE_DIRECTUS_URL || "http://localhost:8055";

export const directus = createDirectus(url)
    .with(rest({ credentials: "include" }))
    .with(authentication("session"));