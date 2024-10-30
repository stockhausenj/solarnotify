export async function onRequest(context) {
  const { request } = context;
  const { code, redirectUri, clientId } = await request.json(); // Get the code from the request body

  const clientSecret = context.env.ENPHASE_CLIENT_SECRET

  const tokenEndpoint = 'https://api.enphaseenergy.com/oauth/token';

  const basicAuth = btoa(`${clientId}:${clientSecret}`);

  const requestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`
      },
      body: requestBody.toString(),
    });

    if (!response.ok) {
      throw new Error('Error fetching access token');
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to obtain access token' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
