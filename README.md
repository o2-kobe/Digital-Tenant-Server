# Tenant Server Backend Setup

## 1. Install Node.js

1. Visit the official Node.js download page:
   - https://nodejs.org/
2. Download and install the LTS version for your operating system.
3. After installation, verify Node.js and npm are available:
   - `node -v`
   - `npm -v`

## 2. Install Visual Studio Code

1. Visit the Visual Studio Code download page:
   - https://code.visualstudio.com/
2. Download and install VS Code for your operating system.
3. Open VS Code once installation completes.

## 3. Open the project files

1. Make sure the project files have already been provided to you.
2. Open Visual Studio Code.
3. In VS Code, choose `File > Open Folder` and select the project folder.
4. Confirm the folder contains `package.json` and the source files.

## 4. Install dependencies

1. In the project folder, run:
   - `npm install`

## 5. Create the `.env` file

1. In the project root, create a file named `.env`.
2. Add the required environment variables.
3. You need a private key for the backend to work.

## 6. Get the private key

1. Visit the JSEncrypt demo page:
   - https://travistidwell.com/jsencrypt/demo/
2. Generate a key pair if necessary.
3. Copy your private key.
4. In your `.env` file, add the private key using this format:
   - `privateKey=---***`

## 7. Start the development server

1. Open a terminal in the project folder.
2. Run:
   - `npm run dev`

## 8. Confirm the server is running

1. Check the terminal output for a successful startup message.
2. The backend is now running in development mode.
