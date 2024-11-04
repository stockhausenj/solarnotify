async function mainHandler(env) {
  const D1_DATABASE = env.D1_SOLARNOTIFY;

  const querySystems = `SELECT UUID, SYSTEM_ID, STATUS, LAST_STATUS, LAST_ENERGY_AT, ENPHASE_REFRESH_TOKEN FROM SOLAR_SYSTEMS`;

  try {
    const systemResults = await D1_DATABASE.prepare(querySystems).all();
    const systemData = systemResults.results;

    if (!Array.isArray(systemData) || systemData.length === 0) {
      console.log('No systems found.');
      return new Response('No solar systems found.', { status: 404 });
    }

    for (const system of systemData) {
      const { UUID, SYSTEM_ID, STATUS, ENPHASE_REFRESH_TOKEN } = system;

      // Update LAST_STATUS to current STATUS
      await D1_DATABASE.prepare(`UPDATE SOLAR_SYSTEMS SET LAST_STATUS = ? WHERE UUID = ?`)
        .bind(STATUS, UUID)
        .run();

      const newTokens = await refreshAccessToken(ENPHASE_REFRESH_TOKEN, env);
      if (!newTokens) {
        console.error(`Failed to refresh access token for system ID: ${UUID}`);
        continue;
      }

      const { newAccessToken, newRefreshToken } = newTokens;

      const enphaseData = await fetchEnphaseData(newAccessToken, SYSTEM_ID, env.ENPHASE_API_KEY);
      if (!enphaseData) {
        console.error(`Failed to fetch Enphase data for system ID: ${UUID}`);
        continue;
      }

      await D1_DATABASE.prepare(
        `UPDATE SOLAR_SYSTEMS SET STATUS = ?, LAST_ENERGY_AT = ?, ENPHASE_ACCESS_TOKEN = ?, ENPHASE_REFRESH_TOKEN = ? WHERE UUID = ?`
      )
        .bind(enphaseData.status, enphaseData.lastEnergyAt, newAccessToken, newRefreshToken, UUID)
        .run();
    }

    const queryEmailSystem = `SELECT EMAIL, SOLAR_SYSTEM FROM EMAIL_SYSTEM_MAPPING`;
    const emailSystemResults = await D1_DATABASE.prepare(queryEmailSystem).all();
    const emailSystemData = emailSystemResults.results;

    if (!Array.isArray(emailSystemData) || emailSystemData.length === 0) {
      return new Response('No email system mappings found.', { status: 404 });
    }

    for (const mapping of emailSystemData) {
      const email = mapping.EMAIL;
      const systemUUID = mapping.SOLAR_SYSTEM;
      const queryEmails = `SELECT MONITOR_STATUS, MONITOR_PRODUCTION FROM EMAILS WHERE EMAIL = ?`;
      const emailResults = await D1_DATABASE.prepare(queryEmails).bind(email).all();
      const emailData = emailResults.results;

      if (emailData && emailData.length > 0) {
        const { MONITOR_STATUS, MONITOR_PRODUCTION } = emailData[0];
        if (MONITOR_STATUS === 1) {
          await handleMonitorStatus(email, systemUUID, env.SENDGRID_API_KEY, D1_DATABASE);
        }
        if (MONITOR_PRODUCTION === 1) {
          handleMonitorProduction(email, systemUUID, env.SENDGRID_API_KEY);
        }
      }
    }

    return new Response('Worker executed successfully.', { status: 200 });
  } catch (error) {
    console.error('Database query error:', error);
    return new Response('Error accessing database', { status: 500 });
  }
}

export default {
  async scheduled(event, env, context) {
    await mainHandler(env);
  },

  async fetch(request, env) {
    await mainHandler(env);
  }
};

async function refreshAccessToken(refreshToken, env) {
  const basicAuth = btoa(`${env.ENPHASE_CLIENT_ID}:${env.ENPHASE_CLIENT_SECRET}`)
  try {
    const response = await fetch('https://api.enphaseenergy.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      })
    });
    const data = await response.json();
    if (response.ok && data.access_token && data.refresh_token) {
      return {
        newAccessToken: data.access_token,
        newRefreshToken: data.refresh_token
      };
    }
    console.error('Failed to refresh token:', data);
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

async function fetchEnphaseData(accessToken, systemId, enphaseAPIKey) {
  try {
    const response = await fetch(`https://api.enphaseenergy.com/api/v4/systems/${systemId}?key=${enphaseAPIKey}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (response.ok && data) {
      return {
        status: data.status,
        lastEnergyAt: data.last_energy_at
      };
    }
    console.error('Failed to fetch Enphase data:', data);
    return null;
  } catch (error) {
    console.error('Error fetching Enphase data:', error);
    return null;
  }
}

async function handleMonitorStatus(email, systemUUID, sendGridAPIKey, D1_DATABASE) {
  console.log(`Checking monitor status for email: ${email} and system UUID: ${systemUUID}`);

  try {
    const querySystemStatus = `SELECT SYSTEM_ID, STATUS, LAST_STATUS FROM SOLAR_SYSTEMS WHERE UUID = ?`;
    const systemStatusResults = await D1_DATABASE.prepare(querySystemStatus).bind(systemUUID).all();
    const systemStatusData = systemStatusResults.results;

    if (systemStatusData && systemStatusData.length > 0) {
      const { SYSTEM_ID, STATUS, LAST_STATUS } = systemStatusData[0];

      if (STATUS !== LAST_STATUS) {
        console.log(`STATUS and LAST_STATUS do not match for system UUID: ${systemUUID}`);
        await sendStatusEmail(email, SYSTEM_ID, STATUS, sendGridAPIKey);
      }
    } else {
      console.error(`No system found with UUID: ${systemUUID}`);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function handleMonitorProduction(email, systemUUID, sendGridAPIKey, D1_DATABASE) {
  console.log(`Checking monitor production for email: ${email} and system UUID: ${systemUUID}`);

  try {
    const querySystemStatus = `SELECT SYSTEM_ID, LAST_ENERGY_AT FROM SOLAR_SYSTEMS WHERE UUID = ?`;
    const systemStatusResults = await D1_DATABASE.prepare(querySystemStatus).bind(systemUUID).all();
    const systemStatusData = systemStatusResults.results;

    if (systemStatusData && systemStatusData.length > 0) {
      const { SYSTEM_ID, LAST_ENERGY_AT } = systemStatusData[0];
      const currentTimestamp = Math.floor(Date.now() / 1000);

      if (currentTimestamp - LAST_ENERGY_AT > 86400) {
        console.log(`LAST_ENERGY_AT for system ID ${SYSTEM_ID} is over 24 hours old.`);
        await sendProductionEmail(email, SYSTEM_ID, sendGridAPIKey)
      } else {
        console.log(`LAST_ENERGY_AT for system ID ${SYSTEM_ID} is within 24 hours.`);
      }
    } else {
      console.error(`No system found with UUID: ${systemUUID}`);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function sendStatusEmail(email, systemId, status, sendGridAPIKey) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridAPIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: `SolarNotify - System Status Update - ${status}`
          }
        ],
        from: {
          email: 'jay.stockhausen@solarnotify.com',
          name: 'SolarNotify'
        },
        content: [
          {
            type: 'text/plain',
            value: `The new status for your system (system ID: ${systemId}) is: ${status}`
          }
        ]
      })
    });

    if (response.ok) {
      console.log(`Email sent successfully to ${email}`);
    } else {
      console.error(`Failed to send email. Status: ${response.status}`);
      const responseBody = await response.text();
      console.error('Response body:', responseBody);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function sendProductionEmail(email, systemId, status, sendGridAPIKey) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridAPIKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email }],
            subject: `SolarNotify - System Status Update - ${status}`
          }
        ],
        from: {
          email: 'jay.stockhausen@solarnotify.com',
          name: 'SolarNotify'
        },
        content: [
          {
            type: 'text/plain',
            value: `No production from your system (system ID: ${systemId}) over at least the last 24 hours`
          }
        ]
      })
    });

    if (response.ok) {
      console.log(`Email sent successfully to ${email}`);
    } else {
      console.error(`Failed to send email. Status: ${response.status}`);
      const responseBody = await response.text();
      console.error('Response body:', responseBody);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
