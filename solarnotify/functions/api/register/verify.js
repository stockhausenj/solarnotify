export async function onRequest(context) {
	const { url } = context;
	const params = new URL(url).searchParams;
	const code = params.get('code');

	if (!code) {
		return new Response('Verification code is required', { status: 400 });
	}

	const D1_DATABASE = context.env.D1_SOLARNOTIFY;

	const selectQuery = `
    SELECT email FROM verifications 
    WHERE code = ? AND email_verified = 0`;

	const result = await D1_DATABASE.prepare(selectQuery)
		.bind(code)
		.first();

	if (!result) {
		return new Response('Invalid verification code or email already verified', { status: 400 });
	}

	const email = result.email;

	const updateQuery = `
    UPDATE verifications 
    SET email_verified = 1 
    WHERE email = ?`;

	await D1_DATABASE.prepare(updateQuery)
		.bind(email)
		.run();

	return new Response('Email verified successfully', { status: 200 });
}
