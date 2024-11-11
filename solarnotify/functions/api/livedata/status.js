export async function onRequest(context) {
  try {
    const D1_DATABASE = context.env.D1_SOLARNOTIFY;

    let query = `
      SELECT STATUS AS name, COUNT(*) AS count
      FROM SOLAR_SYSTEMS
      GROUP BY DATA_SOURCE, STATUS`;

    const { results } = await D1_DATABASE.prepare(query).all();

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
