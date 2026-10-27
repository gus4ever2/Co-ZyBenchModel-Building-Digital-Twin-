# CozyBench — Docker and server deployment

This branch contains the Docker deployment for the three projects. The Compose file is in cosimulator and builds the sibling backend and frontend directories.

## Requirements

- A Linux server with Docker Engine and the Docker Compose plugin. Install Docker using its official guide: https://docs.docker.com/engine/install/
- Git on the server if you deploy by cloning the repository.
- An SSH account on the server.
- A Git remote that contains the docker-deployment branch.

## 1. Set up SSH from Windows

Open PowerShell on your computer. If you do not already have an SSH key, create one:

~~~powershell
ssh-keygen -t ed25519 -C "cozybench-deploy"
~~~

Press Enter to accept the default key path. Add a passphrase if you want the private key protected. Display the public key:

~~~powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
~~~

Add that one-line public key to the server account's ~/.ssh/authorized_keys. Never copy the private id_ed25519 file to the server or repository.

Test the connection, replacing the placeholders with the account and host provided by your server administrator:

~~~powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" SERVER_USER@SERVER_HOST
~~~

To copy a file over SSH, use scp:

~~~powershell
scp .\file.txt SERVER_USER@SERVER_HOST:~/file.txt
~~~

## 2. Push the deployment branch to your Git remote

From the top-level repository folder on your computer, check or configure the remote:

~~~cmd
git remote -v
git remote add origin YOUR_GIT_REMOTE_URL
~~~

Run the second command only if origin is not already configured. Then push both branches:

~~~cmd
git push -u origin master
git push -u origin docker-deployment
~~~

Do not put a password or access token in the remote URL.

## 3. Connect to the server and get the deployment files

Connect over SSH:

~~~powershell
ssh SERVER_USER@SERVER_HOST
~~~

On the server, clone only the deployment branch:

~~~bash
git clone --branch docker-deployment --single-branch YOUR_GIT_REMOTE_URL cozybench
cd cozybench/cosimulator
~~~

If you transfer files with scp instead, keep cozybench-backend, cozybench-frontend and cosimulator together under one parent folder, then enter its cosimulator directory.

## 4. Create the Compose environment file

On the server, from the cosimulator folder:

~~~bash
cp .env.example .env
openssl rand -base64 32
nano .env
~~~

Copy the generated value into JWT_SECRET in .env. Set CORS_ALLOWED_ORIGINS to the browser origin you plan to use, for example http://SERVER_HOST:3000. Keep .env private; Git ignores it.

## 5. Build and start the stack

From the same cosimulator folder:

~~~bash
docker compose config
docker compose up --build -d
docker compose ps
~~~

Compose builds the Python service, Spring backend and frontend, and starts MongoDB. The first build needs internet access. To inspect startup logs:

~~~bash
docker compose logs -f
~~~

Press Ctrl+C to stop following logs; the containers keep running. Open http://SERVER_HOST:3000 after allowing the frontend port through the server firewall.

MongoDB and the co-simulator are bound to the server's loopback interface in Compose. The backend is internal to the Compose network. For a public deployment, put the frontend behind HTTPS and follow the server's firewall policy.

## 6. Stop or update

Stop the containers while preserving the database and application data:

~~~bash
docker compose down
~~~

After pushing updates to the deployment branch, update the server:

~~~bash
cd ~/cozybench
git pull --ff-only
cd cosimulator
docker compose up --build -d
docker compose ps
~~~

Do not run docker compose down -v unless you intend to delete persistent MongoDB and application data volumes.

## Troubleshooting

- SSH permission denied: verify the username, host and public key in that account's ~/.ssh/authorized_keys.
- Git clone or pull fails: confirm the server can access the Git remote and that docker-deployment was pushed.
- Compose reports a missing build context: all three project directories must be siblings inside the same checkout.
- A service is unhealthy: inspect docker compose ps and docker compose logs SERVICE_NAME.
- The browser cannot connect: check the server firewall and that CORS_ALLOWED_ORIGINS matches the browser origin.
- JWT secret is missing: confirm cosimulator/.env exists and JWT_SECRET is not the example placeholder.
