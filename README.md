<div align="center">

# 🚇 Mexico City Transportation Mobile App for Incident Reporting

![Main Animation](public/main_anim.gif)

</div>

## 📖 Description

This mobile application allows users to report incidents in Mexico City's transportation systems. It contributes to improving the safety and efficiency of the transportation system by providing a platform to report problems or situations that require attention. Additionally, it is implementing Open Trip Planner as a routing backend algorithm.

## ✨ Features

- **Incident reporting** in public transportation.
- **Intuitive and easy-to-use interface**.
- Access to **camera and location** for detailed reporting.
- **Installable as a PWA** for a native-like experience.

## 🛠️ Stack and Libraries

The project uses the following technologies and libraries:

- **Node.js**
- **TypeScript**
- **Next.js** (version 13)
- **Spring Boot** (for the backend)
- **Tailwind CSS** (for styling)
- **Material-UI** (for icons)

## 🚀 Installation and Setup

Follow these steps to set up the project locally:

1. **Clone the repository**

   ```bash
   git clone https://github.com/pigchip/pwa-nextjs
   ```

2. **Change to the project directory and install dependencies**

   ```bash
   cd pwa-nextjs/
   npm install
   ```

3. **Set up environment variables**

   Create a file at the root of the project named `.env.local` with the following content. You should place the backend URL:

   ```env
   NEXT_PUBLIC_API_BASE_URL=
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

   Make sure there are no errors or warnings during the build.

5. **Start the project in development mode**

   ```bash
   npm run dev
   ```

6. **Setup for permissions (camera, location, etc.)**

   To use permissions like camera and location, it's necessary to serve the application over HTTPS. You can use **LocalTunnel** or **ngrok**:

   ### 🌐 LocalTunnel

   **LocalTunnel** is a tool that allows you to expose your local server to the web via a temporary URL.

   1. **Install LocalTunnel**:

      You can install LocalTunnel globally using npm:

      ```bash
      npm install -g localtunnel
      ```

   2. **Run LocalTunnel**:

      - If your local application is on port 3000, start the tunnel with:

        ```bash
        lt --port 3000
        ```

      - This will generate a temporary URL (like `https://<subdomain>.loca.lt`) that points to your local application.

   3. **Customize the subdomain** (Optional):

      If you want to use a specific subdomain (if available):

      ```bash
      lt --port 3000 --subdomain <subdomain-name>
      ```

   ### 🌐 ngrok

   **ngrok** is a tool that creates a secure tunnel to your local application, allowing it to be accessible from anywhere via a temporary URL.

   1. **Install ngrok**:

      Download ngrok from [ngrok.com/download](https://ngrok.com/download) and install it according to your operating system.

   2. **Authenticate** (Optional, but recommended):

      - Sign up at [ngrok.com](https://ngrok.com/) to get an authentication token.
      - Authenticate your client by running:

        ```bash
        ngrok authtoken <your-token>
        ```

   3. **Run ngrok**:

      - If your application is running on a specific port (e.g., 3000), you can start a tunnel with:

        ```bash
        ngrok http 3000 --log=stdout
        ```

      - This will generate a temporary URL (like `https://<subdomain>.ngrok.io`) that points to your local application.

   4. **View the traffic**:

      - ngrok provides a web dashboard (by default at `http://localhost:4040`) where you can see all incoming requests and their responses.

7. **Access from other devices on the same network**

   If you want to access the application from another device connected to the same Wi-Fi network:

   - Get your local IP address:

     ```bash
     ipconfig
     ```

   - In the device's browser, enter `http://<your-ip-address>:3000`

8. **Installation as a PWA**

   To install the application as a Progressive Web App (PWA), follow the detailed steps below:

   ### 📱 PWA Installation

   #### For **Chrome** (on mobile devices and desktop):

   1. Open the website in Chrome.
   2. Click on the options menu (three vertical dots in the upper right corner).
   3. Select **"Install App"** or **"Add to Home Screen"**.
   4. Follow the instructions to add it.

   #### For **Safari** (on iOS devices):

   1. Open the website in Safari.
   2. Click on the **"Share"** button (a box with an upward arrow).
   3. Select **"Add to Home Screen"**.
   4. Customize the name if you wish and tap **"Add"**.

## 🔙 Backend

The backend of the project is developed in **Spring Boot**.

[Click here](https://github.com/Angel-GL-GL/MTS_Backend)
