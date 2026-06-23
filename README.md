# replichat

replichat is a GitHub-signed AI chat app for GitHub Pages. It uses Replicate models through a Worker proxy and includes a default Fable Five chat persona plus additional text and image models.

## What is included

- ChatGPT/Claude-style chat layout with sidebar conversations.
- Real GitHub OAuth sign-in. There is no fake username login.
- Replicate API key settings stored only in the browser.
- Worker proxy endpoints for GitHub OAuth token exchange and Replicate prediction calls.
- Multiple model presets including Fable Five, Fable Five Fast, Llama, Mixtral, Mistral, Qwen, DeepSeek Coder, FLUX, SDXL, and Playground v2.5.
- Static hosting support for GitHub Pages.

## Setup

1. Create a GitHub OAuth app.
2. Set the OAuth callback URL to the deployed GitHub Pages URL, for example `https://karimdaman.github.io/replichat/`.
3. Deploy `proxy/cloudflare-worker.js` to Cloudflare Workers.
4. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as Worker environment variables.
5. Open replichat, add the GitHub client ID, GitHub OAuth proxy URL, Replicate API key, and Replicate proxy URL in Settings.

The Replicate proxy URL is the same Worker origin with `/replicate`. The GitHub OAuth URL is the same Worker origin with `/github/oauth`.
