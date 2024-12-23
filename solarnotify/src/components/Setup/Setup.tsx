import { useEffect, useState } from 'react';
import { Notification, Title, Checkbox, Stack, Space, Flex, Card, Text, Button, Select, TextInput, Loader } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { IconCheck } from '@tabler/icons-react';
import classes from './Setup.module.css';

interface systemType {
  city: string;
  state: string;
  system_id: number;
  last_energy_at: number;
  status: string;
}

interface systemAuthType {
  access_token: string;
  refresh_token: string;
}

export function Setup() {
  // loading and verifying systems data state
  const [selectedSolarDataSource, setSelectedSolarDataSource] = useState<string | null>(null);
  const [systemsDataLoading, setSystemsDataLoading] = useState(false);
  const [systemsData, setSystemsData] = useState<systemType[]>([]);
  const [systemsAuthData, setSystemsAuthData] = useState<systemAuthType>({
    access_token: "None",
    refresh_token: "None"
  });
  const [solarDataVerified, setSolarDataVerified] = useState(false);
  const [solarDataErrorNotification, setSolarDataErrorNotification] = useState(false);

  // verifying email state
  const [selectedEmail, setSelectedEmail] = useState('')
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailSentNotificationVisible, setEmailSentNotificationVisible] = useState(false);
  const [emailSentErrorNotificationVisible, setEmailSentErrorNotificationVisible] = useState(false);
  const [emailNotificationVisible, setEmailNotificationVisible] = useState(false);
  const [emailErrorNotificationVisible, setEmailErrorNotificationVisible] = useState(false);
  const [loadingSendEmailVerification, setLoadingSendEmailVerification] = useState(false);
  const [loadingCheckEmailVerification, setLoadingCheckEmailVerification] = useState(false);

  // notification options
  const [notificationOptions, notificationOptionsHandlers] = useListState([
    { key: 'status', label: 'system status', checked: true, index: 0 },
    { key: 'production', label: 'system last production', checked: true, index: 1 },
  ]);
  const [notificationOptionsVerified, setNotificationOptionsVerified] = useState(true);
  const getCheckedValueByKey = (key: string) => {
    const item = notificationOptions.find(option => option.key === key);
    return item ? item.checked : undefined;
  };

  // optional inputs
  const [selectedSolarInstaller, setSelectedSolarInstaller] = useState<string | null>(null);

  // data options
  const [allowAnalytics, setAllowAnalytics] = useState(true);
  const allowAnalyticsHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllowAnalytics(event.currentTarget.checked);
  }

  // submit state
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const notificationBoxes = notificationOptions.map((value, index) => (
    <Checkbox
      color="green.6"
      iconColor="dark.8"
      label={value.label}
      key={value.index}
      checked={value.checked}
      onChange={(event) => {
        notificationOptionsHandlers.setItemProp(index, 'checked', event.currentTarget.checked);
      }}
    />
  ));

  const enphaseClientId = 'eef7fb7a4aa9834d2988819df395a83c';

  const currentHostname = window.location.hostname;
  const currentPort = window.location.port;
  const redirectUri = `${window.location.protocol}//${currentHostname}${currentPort ? `:${currentPort}` : ''}`;


  const validateSolarData = () => {
    switch (selectedSolarDataSource) {
      case "Enphase":
        console.log("validating enphase data")
        setSolarDataVerified(true);
    }
  }

  const getSolarData = () => {
    switch (selectedSolarDataSource) {
      case "Enphase":
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          setSystemsDataLoading(true);

          fetch('/api/solardata/enphase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, redirectUri, clientId: enphaseClientId }),
          })
            .then(response => {
              if (response.ok) {
                return response.json()
              } else {
                return Promise.reject('Response not OK');
              }
            })
            .then(data => {
              setSystemsDataLoading(false);
              setSystemsData(data.systems);
              setSystemsAuthData(data.auth);
              window.history.replaceState({}, document.title, window.location.pathname);
            })
            .catch(error => {
              setSystemsDataLoading(false);
              setSolarDataErrorNotification(true);
              console.error('Error during setup:', error);
            });
        }
    }
  }

  const authSolarData = () => {
    switch (selectedSolarDataSource) {
      case "Enphase":
        const authEndpoint = 'https://api.enphaseenergy.com/oauth/authorize';
        const authUrl = `${authEndpoint}?response_type=code&client_id=${enphaseClientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = authUrl;
    }
    if (selectedSolarDataSource) {
      localStorage.setItem("selectedSolarDataSource", selectedSolarDataSource);
    }
  };

  const sendEmailVerification = () => {
    setLoadingSendEmailVerification(true);
    fetch('/api/email/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: selectedEmail.trim() })
    })
      .then(response => {
        if (response.ok) {
          setEmailSentNotificationVisible(true);
        } else {
          return Promise.reject('Response not OK');
        }
      })
      .catch(error => {
        console.error('email send fail:', error);
        setEmailSentErrorNotificationVisible(true);
      });
    setLoadingSendEmailVerification(false);
  }

  const checkEmailVerification = () => {
    setLoadingCheckEmailVerification(true);
    fetch(`/api/email/verified?email=${selectedEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (!response.ok) {
          setEmailErrorNotificationVisible(true);
          setLoadingCheckEmailVerification(false);
          throw new Error(`HTTP error during email verification: ${response.status}`)
        } else {
          return response.json();
        }
      })
      .then(data => {
        if (data.verified) {
          setEmailVerified(true);
        } else {
          setEmailNotificationVisible(true);
        }
      })
      .catch(error => {
        console.error("error during email verification", error);
      })
    setLoadingCheckEmailVerification(false);
  }

  const submit = () => {
    setLoadingSubmit(true);
    systemsData.forEach(system => {
      let optionalInstaller = selectedSolarInstaller;
      if (optionalInstaller === null) {
        optionalInstaller = "None";
      }
      let submitData = {
        data_source: selectedSolarDataSource,
        system_id: system.system_id,
        status: system.status,
        last_energy_at: system.last_energy_at,
        state: system.state,
        city: system.city,
        enphase_access_token: systemsAuthData.access_token,
        enphase_refresh_token: systemsAuthData.refresh_token,
        email: selectedEmail,
        monitor_status: getCheckedValueByKey('status'),
        monitor_production: getCheckedValueByKey('production'),
        installer: optionalInstaller,
        allow_analytics: allowAnalytics,
      };
      fetch('/api/solarsystem/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })
        .then(response => {
          setLoadingSubmit(false);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json(); // or response.text() if it's not JSON
        })
        .then(data => {
          console.log('Response body:', data);
        })
        .catch(error => {
          setLoadingSubmit(false);
          console.error('Error:', error);
        });
    });
  };

  useEffect(() => {
    if (notificationOptions.some((item) => item.checked)) {
      setNotificationOptionsVerified(true);
    } else {
      setNotificationOptionsVerified(false);
    }
  }, [notificationOptions]);

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

  useEffect(() => {
    if (selectedSolarDataSource === null) {
      setSolarDataVerified(false);
    }
  }, [systemsData]);


  return (
    <>
      <Space h="lg" />
      <Title order={5}>
        Solar Data
        {solarDataVerified && <IconCheck style={{ color: 'green', marginRight: '5px' }} />}
      </Title>
      {(solarDataErrorNotification) && (
        <Space h="lg" />
      )}
      {solarDataErrorNotification && (
        <Notification color="red" onClose={() => setSolarDataErrorNotification(false)}>
          Failed to retrieve solar data. Please retry and/or report issue to site owner.
        </Notification>
      )}

      <Select
        mt="md"
        classNames={classes}
        comboboxProps={{ withinPortal: true }}
        data={['Enphase']}
        placeholder="pick one"
        label="data source"
        value={selectedSolarDataSource}
        onChange={(value) => {
          setSelectedSolarDataSource(value);
          setSolarDataVerified(false);
        }}
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
      {(systemsData && solarDataVerified) && (
        <Text c="dimmed" size="sm">Systems to monitor...</Text>
      )}
      {(systemsData && solarDataVerified) && (
        <Card withBorder shadow="sm" radius="md" padding="lg">
          <Text component="pre" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(systemsData, null, 2)}
          </Text>
        </Card>
      )}

      <Space h="lg" />
      <Title order={5}>
        Email
        {(emailVerified && solarDataVerified) && <IconCheck style={{ color: 'green', marginRight: '5px' }} />}
      </Title>
      {(emailNotificationVisible || emailSentNotificationVisible) && (
        <Space h="lg" />
      )}
      {emailNotificationVisible && (
        <Notification color="red" onClose={() => setEmailNotificationVisible(false)}>
          Email in system, but not verified yet. Follow link sent in email to verify email. Check spam folder if email not found.
        </Notification>
      )}
      {emailErrorNotificationVisible && (
        <Notification color="red" onClose={() => setEmailErrorNotificationVisible(false)}>
          Email not found. Please send email verification.
        </Notification>
      )}
      {emailSentNotificationVisible && (
        <Notification color="green" onClose={() => setEmailSentNotificationVisible(false)}>
          Verification email sent successfully! Check your spam folder.
        </Notification>
      )}
      {emailSentErrorNotificationVisible && (
        <Notification color="red" onClose={() => setEmailSentErrorNotificationVisible(false)}>
          Failed to send verification email. Please retry.
        </Notification>
      )}

      <Space h="md" />
      <TextInput
        value={selectedEmail}
        onChange={(event) => {
          setSelectedEmail(event.currentTarget.value)
          setEmailVerified(false);
        }}
        label="email address"
        placeholder="bob@gmail.com"
        classNames={classes}
      />
      <div style={{ marginTop: '20px' }}>
        <Flex gap="md">
          <Button disabled={!solarDataVerified || !selectedEmail} onClick={sendEmailVerification} color="green" loading={loadingSendEmailVerification} loaderProps={{ type: 'dots' }}>
            send email verification
          </Button>
          <Button disabled={!solarDataVerified || !selectedEmail} onClick={checkEmailVerification} color="green" loading={loadingCheckEmailVerification} loaderProps={{ type: 'dots' }}>
            check email verification
          </Button>
        </Flex>
      </div>

      <Space h="lg" />
      <Space h="lg" />
      <Title order={5}>
        Notification Rules
        {(notificationOptionsVerified && emailVerified && solarDataVerified) && <IconCheck style={{ color: 'green', marginRight: '5px' }} />}
      </Title>
      <Text c="dimmed" size="sm">Rules are evaluated hourly for each system.</Text>
      <Text c="dimmed" size="sm">Production alerts occur if last production is older than 24h.</Text>
      <Space h="md" />
      <Stack>
        {notificationBoxes}
      </Stack>
      <Space h="lg" />
      <Space h="lg" />
      <Title order={5}>
        Optional Inputs
      </Title>
      <Select
        mt="md"
        classNames={classes}
        comboboxProps={{ withinPortal: true }}
        data={['self', 'ION', 'Titan', 'BriteStreet', 'Atlasta', 'GRID']}
        placeholder="pick one"
        label="solar installer"
        value={selectedSolarInstaller}
        onChange={(value) => {
          setSelectedSolarInstaller(value);
        }}
      />

      <Space h="lg" />
      <Space h="lg" />
      <Checkbox
        checked={allowAnalytics}
        size="xs"
        label="Allow your system data to be used for analytics."
        onChange={allowAnalyticsHandler}
      />
      <div style={{ marginTop: '20px' }}>
        <Button disabled={!solarDataVerified || !emailVerified || !notificationOptionsVerified} onClick={submit} color="green" loading={loadingSubmit} loaderProps={{ type: 'dots' }}>
          submit
        </Button>
      </div>
    </>
  );
}
