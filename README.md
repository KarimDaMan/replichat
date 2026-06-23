# replichat

replichat is a simple-login AI chat app for GitHub Pages. It uses Replicate models through a Worker proxy and includes a default Fable Five chat persona plus additional text and image models.

## What is included

- ChatGPT/Claude-style chat layout with sidebar conversations.
- Saved chats in browser local storage.
- Simple browser-local login. The login prompt appears only when a user tries to send without being logged in.
- Replicate API key settings stored only in the browser.
- Worker proxy endpoint for real Replicate prediction calls.
- Multiple model presets including Fable Five, Fable Five Fast, Llama, Mixtral, Mistral, Qwen, DeepSeek Coder, FLUX, SDXL, and Playground v2.5.
- Text chat and image generation model support.
- Static hosting support for GitHub Pages.

## Setup

1. Deploy `proxy/cloudflare-worker.js` to Cloudflare Workers.
2. Open replichat, add the Replicate API key and Replicate proxy URL in Settings.
3. Login with a name in the browser and send a message.

The Replicate proxy URL is the Worker origin with `/replicate`.
