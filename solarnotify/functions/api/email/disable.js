export async function onRequest(context) {
	const request = context.request;
	const url = new URL(request.url);
	const D1_DATABASE = context.env.D1_SOLARNOTIFY;

	const email = url.searchParams.get('email');

	if (!email) {
		return new Response('Email address is required', { status: 400 });
	}

	const selectQuery = `
      SELECT email_verified FROM users 
      WHERE email = ?`;

	const result = await D1_DATABASE.prepare(selectQuery)
		.bind(email)
		.first();

	if (!result) {
		return new Response('Email not found', { status: 404 });
	}

	const deleteQuery = `
      DELETE FROM users 
      WHERE email = ?`;

	await D1_DATABASE.prepare(deleteQuery)
		.bind(email)
		.run();

	return new Response(JSON.stringify({ deleted: true }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
}
