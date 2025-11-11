# AI Video Engine Frontend

This is the frontend for the AI Video Engine, built with Next.js, Tailwind CSS, and Firebase.

## Prerequisites

*   **Node.js 18+**
*   **npm** or **yarn**

## Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env.local` file from the example:
    ```bash
    cp .env.local.example .env.local
    ```

2.  Edit `.env.local` and fill in your configuration:

    *   **`NEXT_PUBLIC_API_BASE_URL`**: The URL where your backend is running (e.g., `http://localhost:8000` for local development, or your Cloud Run URL).
    *   **Firebase Configuration**: You need to create a Firebase project and a Web App within it. You can find these values in the Firebase Console under **Project Settings > General > Your apps**.

    ```ini
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment (Firebase Hosting)

This project uses Firebase's experimental web frameworks support for Next.js.

1.  **Install Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login**:
    ```bash
    firebase login
    ```

3.  **Enable Web Frameworks**:
    ```bash
    firebase experiments:enable webframeworks
    ```

4.  **Initialize Hosting**:
    ```bash
    firebase init hosting
    ```
    *   Detected an existing Next.js codebase in the current directory, should we use this? **Yes**
    *   In which region would you like to host server-side content, if applicable? **us-central1** (or your preferred region)
    *   Set up automatic builds and deploys with GitHub? **No** (unless you want to)

5.  **Deploy**:
    ```bash
    firebase deploy
    ```

    **Note on Production Configuration:**
    When deploying, ensure your `NEXT_PUBLIC_API_BASE_URL` points to your production backend (e.g., your Cloud Run URL). You can set this in a `.env.production` file or directly in the Firebase Console settings.
