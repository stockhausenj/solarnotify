export async function onRequest(context) {
  const { request } = context;
  const { email } = await request.json();

  const SENDGRID_API_KEY = context.env.SENDGRID_API_KEY;
  const D1_DATABASE = context.env.D1_SOLARNOTIFY;

  const verificationCode = Math.random().toString(36).substring(2, 10);

  const upsertQuery = `
    INSERT INTO users (email, email_verification_code) 
    VALUES (?, ?) 
    ON CONFLICT(email) DO UPDATE SET email_verification_code = ?`;

  const result = await D1_DATABASE.prepare(upsertQuery)
    .bind(email, verificationCode, verificationCode)
    .run();

  console.log(result);

  const verificationLink = `https://solarnotify.com/api/register/verify?code=${verificationCode}`;

  const emailData = {
    personalizations: [
      { to: [{ email: email }] },
    ],
    from: { email: "jay.stockhausen@solarnotify.com" },
    subject: "SolarNotify - Email Verification",
    content: [
      {
        type: "text/plain",
        value: `Please verify your email by clicking the following link: ${verificationLink}`,
      },
    ],
  };

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
