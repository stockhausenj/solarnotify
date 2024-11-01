export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const D1_DATABASE = context.env.D1_SOLARNOTIFY;

  if (request.method === "GET") {
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

    const isVerified = result.email_verified === 1;
    return new Response(JSON.stringify({ email, verified: isVerified }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else if (request.method === "POST") {
    const code = url.searchParams.get('code');

    if (!code) {
      return new Response('Verification code is required', { status: 400 });
    }


    const selectQuery = `
    SELECT email FROM users 
    WHERE email_verification_code = ? AND email_verified = 0`;

    const result = await D1_DATABASE.prepare(selectQuery)
      .bind(code)
      .first();

    if (!result) {
      return new Response('Invalid verification code or email already verified', { status: 400 });
    }

    const email = result.email;

    const updateQuery = `
    UPDATE users 
    SET email_verified = 1 
    WHERE email = ?`;

    await D1_DATABASE.prepare(updateQuery)
      .bind(email)
      .run();

    return new Response('Email verified successfully', { status: 200 });
  }
}
