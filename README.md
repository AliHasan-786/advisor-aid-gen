# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/62b2ddd8-207c-403f-8102-9d67eef657e2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/62b2ddd8-207c-403f-8102-9d67eef657e2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Step-by-step setup guide (macOS & Cursor friendly)

1. **Install the developer command line tools (no Xcode needed).** Open Terminal (or Cursor's terminal) and run:
   ```sh
   xcode-select --install
   ```
   macOS will prompt you to install the lightweight Command Line Tools package that provides Git. After installation, accept the license one time:
   ```sh
   sudo xcodebuild -license accept
   ```

2. **Install Node.js.** We recommend using `nvm` so you can manage Node versions easily:
   ```sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   source ~/.nvm/nvm.sh
   nvm install --lts
   ```

3. **Clone the repository.**
   ```sh
   git clone https://github.com/AliHasan-786/advisor-aid-gen.git
   cd advisor-aid-gen
   ```

4. **Install project dependencies.**
   ```sh
   npm install
   ```

5. **Create your environment file.** Copy `.env.example` to `.env` if it exists (or create `.env`) and populate the Supabase variables:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-public-anon-key>
   VITE_SUPABASE_PROJECT_ID=<your-project-id>
   ```

6. **Start the development server.**
   ```sh
   npm run dev
   ```
   Vite will print a local URL (usually `http://localhost:5173`). Open that URL in your browser or Cursor's preview pane.

7. **Stop the server when finished.** Press `Ctrl+C` in the terminal to stop the dev server.

> **Tip for Windows users:** Install [Node.js LTS](https://nodejs.org/en/download) and [Git for Windows](https://git-scm.com/download/win), then run the same clone/install/dev commands in PowerShell.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/62b2ddd8-207c-403f-8102-9d67eef657e2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
