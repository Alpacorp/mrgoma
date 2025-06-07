This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started Mr goma Tires V1  

First, run the development server: 

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment configuration

Before running the application you must provide a `.env` file with the database
connection details. Use `.env.template` as a starting point:

```bash
cp .env.template .env
```

Fill in the values for `SERVER_URL`, `DB_NAME`, `DB_USER` and `DB_PASSWORD`.
These variables are **only** consumed by the server and therefore **must not**
be prefixed with `NEXT_PUBLIC_`. In Next.js, any variable that begins with this
prefix is exposed to the browser. By omitting it we keep the credentials
private. If in the future you need a variable to be readable on the client you
can declare it again with the `NEXT_PUBLIC_` prefix, but sensitive values should
remain server-only.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
