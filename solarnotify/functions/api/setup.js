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
		const accessToken = data.access_token;

		const systemsResponse = await fetch(`https://api.enphaseenergy.com/api/v4/systems?key=${context.env.ENPHASE_API_KEY}`, {
			headers: {
				'Authorization': `Bearer ${accessToken}`,
			},
		});

		if (!systemsResponse.ok) {
			throw new Error('Error fetching systems data');
		}

		const systemsData = await systemsResponse.json();

		const systemsList = systemsData.systems.map(system => ({
			system_id: system.system_id,
			status: system.status,
			last_energy_at: system.last_energy_at
		}));

		return new Response(JSON.stringify(systemsList), {
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
