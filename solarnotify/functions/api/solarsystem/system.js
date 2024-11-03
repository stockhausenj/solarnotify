import { v4 as uuidv4 } from 'uuid';

export async function onRequest(context) {
	try {
		const { request } = context;
		const { data_source, system_id, status, last_energy_at, state, city, enphase_access_token,
			enphase_refresh_token, email, monitor_status, monitor_production, installer,
			allow_analytics } = await request.json();

		const D1_DATABASE = context.env.D1_SOLARNOTIFY;

		// Insert or update SOLAR_SYSTEMS
		let newId = uuidv4();
		let query = `
      INSERT INTO SOLAR_SYSTEMS (UUID, DATA_SOURCE, SYSTEM_ID, STATUS, LAST_STATUS,
                                 LAST_ENERGY_AT, LO_STATE, LO_CITY, ENPHASE_ACCESS_TOKEN,
                                 ENPHASE_REFRESH_TOKEN, INSTALLER, ALLOW_ANALYTICS) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(DATA_SOURCE, SYSTEM_ID) DO UPDATE SET ALLOW_ANALYTICS = EXCLUDED.ALLOW_ANALYTICS`;

		await D1_DATABASE.prepare(query)
			.bind(newId, data_source, system_id, status, status, last_energy_at, state, city,
				enphase_access_token, enphase_refresh_token, installer, allow_analytics)
			.run();

		// Insert or ignore in EMAIL_SYSTEMS_MAPPING
		newId = uuidv4();
		query = `
      INSERT INTO EMAIL_SYSTEMS_MAPPING (UUID, EMAIL, SOLAR_SYSTEM)
      VALUES (?, ?, ?)
      ON CONFLICT(EMAIL, SOLAR_SYSTEM) DO NOTHING`;

		await D1_DATABASE.prepare(query)
			.bind(newId, email, system_id)
			.run();

		// Insert or update EMAILS
		query = `
      INSERT INTO EMAILS (EMAIL, MONITOR_STATUS, MONITOR_PRODUCTION)
      VALUES (?, ?, ?)
      ON CONFLICT (EMAIL)
      DO UPDATE SET
        MONITOR_STATUS = EXCLUDED.MONITOR_STATUS,
        MONITOR_PRODUCTION = EXCLUDED.MONITOR_PRODUCTION`;

		await D1_DATABASE.prepare(query)
			.bind(email, monitor_status, monitor_production)
			.run();

		return new Response('success', { status: 200 });
	} catch (error) {
		return new Response(`Error: ${error.message}`, { status: 500 });
	}
}
