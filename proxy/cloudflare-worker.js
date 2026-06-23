const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function isTerminal(status) {
  return status === "succeeded" || status === "failed" || status === "canceled";
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function exchangeGithubOAuth(request, env) {
  const body = await request.json();
  const { code, codeVerifier, clientId, redirectUri } = body;
  const githubClientId = env.GITHUB_CLIENT_ID || clientId;
  const githubClientSecret = env.GITHUB_CLIENT_SECRET;

  if (!code || !codeVerifier || !githubClientId || !githubClientSecret) {
    return new Response(
      JSON.stringify({
        error:
          "code, codeVerifier, GITHUB_CLIENT_ID, and GITHUB_CLIENT_SECRET are required",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: githubClientId,
      client_secret: githubClientSecret,
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  });
  const tokenPayload = await tokenResponse.json();

  if (!tokenResponse.ok || tokenPayload.error || !tokenPayload.access_token) {
    return new Response(
      JSON.stringify({
        error:
          tokenPayload.error_description ||
          tokenPayload.error ||
          "GitHub token exchange failed",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const profileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenPayload.access_token}`,
      "User-Agent": "replichat",
      Accept: "application/vnd.github+json",
    },
  });
  const profile = await profileResponse.json();

  return new Response(JSON.stringify({ profile }), {
    status: profileResponse.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function runReplicatePrediction(request) {
  const body = await request.json();
  const { apiKey, version, input, prefer = "wait=60" } = body;

  if (!apiKey || !version || !input) {
    return new Response(
      JSON.stringify({ error: "apiKey, version, and input are required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const replicateResponse = await fetch(
    "https://api.replicate.com/v1/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: prefer,
      },
      body: JSON.stringify({ version, input }),
    },
  );

  let prediction = await replicateResponse.json();

  for (let index = 0; index < 18; index += 1) {
    if (isTerminal(prediction.status) || !prediction.urls?.get) {
      break;
    }

    await sleep(2000);
    const pollResponse = await fetch(prediction.urls.get, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    prediction = await pollResponse.json();
  }

  return new Response(JSON.stringify(prediction), {
    status: replicateResponse.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const worker = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const url = new URL(request.url);
      if (url.pathname.endsWith("/github/oauth")) {
        return exchangeGithubOAuth(request, env);
      }

      return runReplicatePrediction(request);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Proxy failed",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  },
};

export default worker;
