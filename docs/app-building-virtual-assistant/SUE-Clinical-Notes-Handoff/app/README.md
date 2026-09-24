# SUE Clinical Notes

This is the isolated friend-testing source export dated 2026-09-23.
Read ../朋友测试指南.md for setup and ../开发交接与已知限制.md for current scope.

Copy .env.example to .env, then run:

    npm ci
    npx prisma migrate deploy
    npm run db:seed
    npm run typecheck
    npm run db:verify
    npm run test:access
    npm run dev

Open http://127.0.0.1:3000/login and choose your own test password. Only fictional records are provided. No clinical sample, password, session, database, or real environment file is distributed.

The exported .env.example and README are simplified for independent testing; application source is unchanged from 04de4a7. The optional import-demo.mjs needs a local sample that is deliberately not distributed. No deployment or patient use is authorized by this test package.
