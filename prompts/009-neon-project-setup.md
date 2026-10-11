# Prompt 009 — Neon project setup

Pasted Neon setup instructions (project `mute-heart-72771152`, branch `production`):

1. `npm i -g neon@latest && neon login`
2. `neon skills -y`
3. `neon mcp -y`
4. `neon link --project-id mute-heart-72771152 --branch production -y`
5. `neon config init`
6. Update `neon.ts` to `defineConfig({})` from `@neon/config/v1`
7. `neon deploy`
