import { useEffect, useState } from 'react';
import { Space, Flex, Card, Text, Button, Select, TextInput, Loader } from '@mantine/core';
import classes from './Setup.module.css';

export function Setup() {
  const [loading, setLoading] = useState(false);
  const [systemsData, setSystemsData] = useState<any>(null)
  const [selectedSolarDataSource, setSelectedSolarDataSource] = useState<string | null>(null);

  const currentHostname = window.location.hostname;
  const currentPort = window.location.port;
  const redirectUri = `${window.location.protocol}//${currentHostname}${currentPort ? `:${currentPort}` : ''}`;
  const clientId = 'eef7fb7a4aa9834d2988819df395a83c';

  const handleInitiateSetup = () => {
    const authEndpoint = 'https://api.enphaseenergy.com/oauth/authorize';
    const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    localStorage.setItem("selectedSolarDataSource", selectedSolarDataSource);
    window.location.href = authUrl;
  };

  useEffect(() => {
    const savedSolarDataSource = localStorage.getItem("selectedSolarDataSource");
    if (savedSolarDataSource) {
      setSelectedSolarDataSource(savedSolarDataSource);
      localStorage.removeItem("selectedSolarDataSource")
    }
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      setLoading(true);

      fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, redirectUri, clientId }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Setup successful:', data);
          setSystemsData(data);
          setLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch(error => {
          console.error('Error during setup:', error);
          setLoading(false);
        });
    }
  }, []);

  return (
    <>
      <h2>Setup</h2>
      <h3>Solar System Check</h3>
      <Select
        mt="md"
        classNames={classes}
        comboboxProps={{ withinPortal: true }}
        data={['Enphase']}
        placeholder="pick one"
        label="data source"
        onChange={setSelectedSolarDataSource}
      />
      <div style={{ marginTop: '20px' }}>
        <Button disabled={!selectedSolarDataSource} onClick={handleInitiateSetup} color="green">
          verify solar data
        </Button>
      </div>
      {loading && (
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

      <h3>Email Check</h3>
      <TextInput label="email address" placeholder="bob@gmail.com" classNames={classes} />
      <div style={{ marginTop: '20px' }}>
        <Flex gap="md">
          <Button onClick={handleInitiateSetup} color="green">
            send email verification
          </Button>
          <Button onClick={handleInitiateSetup} color="green">
            check email verification
          </Button>
        </Flex>
      </div>
      {loading && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Loader color="green" />
          <p>Loading, please wait...</p>
        </div>
      )}
    </>
  );
}
