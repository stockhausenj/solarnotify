import { useEffect, useState } from 'react';
import { Title, Checkbox, Stack, Space, Flex, Card, Text, Button, Select, TextInput, Loader } from '@mantine/core';
import classes from './Setup.module.css';

export function Setup() {
  const [systemsDataLoading, setSystemsDataLoading] = useState(false);
  const [systemsData, setSystemsData] = useState<any>(null)
  const [selectedSolarDataSource, setSelectedSolarDataSource] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState('')
  const [solarDataVerified, setSolarDataVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const enphaseClientId = 'eef7fb7a4aa9834d2988819df395a83c';

  const currentHostname = window.location.hostname;
  const currentPort = window.location.port;
  const redirectUri = `${window.location.protocol}//${currentHostname}${currentPort ? `:${currentPort}` : ''}`;

  const validateSolarData = () => {
    switch (selectedSolarDataSource) {
      case "Enphase":
        console.log("validating enphase data")
        console.log('Setup successful:', systemsData);
        setSolarDataVerified(true);
    }
  }

  const getSolarData = () => {
    switch (selectedSolarDataSource) {
      case "Enphase":
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const clientId = enphaseClientId;
        if (code) {
          setSystemsDataLoading(true);

          fetch('/api/setup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, redirectUri, clientId }),
          })
            .then(response => response.json())
            .then(data => {
              //console.log('Setup successful:', data);
              setSystemsData(data);
              setSystemsDataLoading(false);
              window.history.replaceState({}, document.title, window.location.pathname);
            })
            .catch(error => {
              console.error('Error during setup:', error);
              setSystemsDataLoading(false);
            });
        }
    }
  }

  const authSolarData = () => {
    switch (selectedSolarDataSource) {
      case "Enphase":
        const clientId = enphaseClientId;
        const authEndpoint = 'https://api.enphaseenergy.com/oauth/authorize';
        const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authUrl;
    }
    if (selectedSolarDataSource) {
      localStorage.setItem("selectedSolarDataSource", selectedSolarDataSource);
    }
  };

  const sendEmailVerification = () => {
    fetch('/api/email/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: selectedEmail.trim() })
    })
      .then(response => response.json())
      .then(data => {
        console.log('email send successful:', data);
      })
      .catch(error => {
        console.error('email send fail:', error);
      });
  }

  const checkEmailVerification = () => {
    fetch(`/api/email/verify?email=${selectedEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (!response.ok) {
          console.log("network error during email verification");
        } else {
          setEmailVerified(true);
        }
      })
      .then(data => {
        console.log("email verificaiton data", data);
      })
      .catch(error => {
        console.error("error during email verification", error);
      })
  }

  useEffect(() => {
    const savedSolarDataSource = localStorage.getItem("selectedSolarDataSource");
    if (savedSolarDataSource) {
      setSelectedSolarDataSource(savedSolarDataSource);
      localStorage.removeItem("selectedSolarDataSource")
    }
  }, []);

  useEffect(() => {
    if (selectedSolarDataSource) {
      getSolarData();
    }
  }, [selectedSolarDataSource]);

  useEffect(() => {
    if (systemsData !== null) {
      validateSolarData();
    }
  }, [systemsData]);


  return (
    <>
      <Title order={3}>Setup</Title>
      <Space h="lg" />
      <Title order={4}>Solar System Check</Title>
      <Select
        mt="md"
        classNames={classes}
        comboboxProps={{ withinPortal: true }}
        data={['Enphase']}
        placeholder="pick one"
        label="data source"
        value={selectedSolarDataSource}
        onChange={setSelectedSolarDataSource}
      />
      <div style={{ marginTop: '20px' }}>
        <Button disabled={!selectedSolarDataSource} onClick={authSolarData} color="green">
          verify solar data
        </Button>
      </div>
      {systemsDataLoading && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Loader color="green" />
          <p>Loading, please wait...</p>
        </div>
      )}
      <Space h="md" />
      {systemsData && (
        <Card withBorder shadow="sm" radius="md" padding="lg">
          <Text component="pre" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(systemsData, null, 2)}
          </Text>
        </Card>
      )}

      <Space h="lg" />
      <Title order={4}>Email Check</Title>
      <Space h="md" />
      <TextInput
        value={selectedEmail}
        onChange={(event) => setSelectedEmail(event.currentTarget.value)}
        label="email address"
        placeholder="bob@gmail.com"
        classNames={classes}
      />
      <div style={{ marginTop: '20px' }}>
        <Flex gap="md">
          <Button disabled={!solarDataVerified || !selectedEmail} onClick={sendEmailVerification} color="green">
            send email verification
          </Button>
          <Button disabled={!solarDataVerified || !selectedEmail} onClick={checkEmailVerification} color="green">
            check email verification
          </Button>
        </Flex>
      </div>

      <Space h="lg" />
      <Space h="lg" />
      <Title order={4}>Notification Rules</Title>
      <Text c="dimmed" size="sm">Rules are evaluated hourly for each system.</Text>
      <Text c="dimmed" size="sm">Production alerts occur if last production is older than 24h.</Text>
      <Space h="md" />
      <Stack>
        <Checkbox
          defaultChecked
          //color="lime.4"
          color="green.6"
          iconColor="dark.8"
          size="md"
          label="system status"
        />
        <Checkbox
          defaultChecked
          color="green.6"
          iconColor="dark.8"
          size="md"
          label="system last production"
        />
      </Stack>

      <Space h="md" />
      <div style={{ marginTop: '20px' }}>
        <Button disabled={!emailVerified} onClick={authSolarData} color="green">
          submit
        </Button>
      </div>

    </>
  );
}
