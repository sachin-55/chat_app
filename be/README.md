## SETUP

### 1. Install Dependencies

- `pnpm install` or any other package manager

### 2. Environment Variables

- `cp .env.example .env`

### 3. Generate VAPID Keys

- `npx web-push generate-vapid-keys`
- copy and paste the keys in the .env file
- `VAPID_PUBLIC_KEY` = public key
- `VAPID_PRIVATE_KEY` = private key
- `VAPID_EMAIL` = your email

### 4. Run the server

- `pnpm run dev` to start the development server
