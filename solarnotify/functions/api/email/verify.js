export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const D1_DATABASE = context.env.D1_SOLARNOTIFY;

  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Verification code is required', { status: 400 });
  }

  const selectQuery = `
    SELECT EMAIL FROM EMAILS 
    WHERE EMAIL_VERIFICATION_CODE = ? AND EMAIL_VERIFIED = FALSE`;

  const result = await D1_DATABASE.prepare(selectQuery)
    .bind(code)
    .first();

  if (!result) {
    return new Response('Invalid verification code or email already verified', { status: 400 });
  }

  const email = result.email;

  const updateQuery = `
    UPDATE EMAILS 
    SET EMAIL_VERIFIED = TRUE
    WHERE EMAIL = ?`;

  await D1_DATABASE.prepare(updateQuery)
    .bind(email)
    .run();

  return new Response('Email verified successfully', { status: 200 });
}
