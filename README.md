## Prerequisites

- **Node.js**: Version 20+
- **pnpm**: Used for package management.
  - If you don't have pnpm installed, run:
    ```sh
    npm install -g pnpm
    ```
- **.env file**: Place at root of project folder

## Installation

1. Clone the repository:
   ```sh
   git clone git@github.com:guyvaserman/my-training-app.git
   cd my-training-app
   pnpm install
   ```
2. Running Project:
   ```sh
   pnpm dev
   ```
3. Running Database:

In the root of the project there has to be a `.env` file that contains the database connection parameters and Google Auth keys.
See `.env.example` for the required variables.

You can either use the cloud Neon database or run the database locally.

### Running the database locally:

To run the database locally, run the following command:

```sh
docker compose up -d
```

It will init a postgres database exposed on port 8080, check the `docker-compose.yml` file for credentials.

## Deployment

### Vercel CLI Setup

1. Install Vercel CLI globally:

   ```sh
   npm install -g vercel
   ```

2. Login to Vercel:

   ```sh
   vercel login
   ```

3. Deploy to production:

   ```sh
   vercel --prod
   ```

4. Deploy preview:
   ```sh
   vercel
   ```

### Sam's Machine:

OS: Ubuntu 22

## Run Github Actions Locally

https://nektosact.com/installation/gh.html
