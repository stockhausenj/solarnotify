export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const D1_DATABASE = context.env.D1_SOLARNOTIFY;

  const email = url.searchParams.get('email');

  if (!email) {
    return new Response('Email address is required', { status: 400 });
  }

  const selectQuery = `
      SELECT EMAIL_VERIFIED FROM EMAILS 
      WHERE EMAIL = ?`;

  const result = await D1_DATABASE.prepare(selectQuery)
    .bind(email)
    .first();

  if (!result) {
    return new Response('Email not found', { status: 404 });
  }

  const isVerified = result.EMAIL_VERIFIED === 1;
  return new Response(JSON.stringify({ verified: isVerified }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
