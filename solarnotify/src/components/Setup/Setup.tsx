import { useEffect, useState } from 'react';
import { Notification, Title, Checkbox, Stack, Space, Flex, Card, Text, Button, Select, TextInput, Loader } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { IconCheck } from '@tabler/icons-react';
import classes from './Setup.module.css';

export function Setup() {
	const [emailSentNotificationVisible, setEmailSentNotificationVisible] = useState(false);
	const [emailNotificationVisible, setEmailNotificationVisible] = useState(false);
	const [systemsData, setSystemsData] = useState<any>(null)
	const [systemsDataLoading, setSystemsDataLoading] = useState(false);
	const [solarDataVerified, setSolarDataVerified] = useState(false);
	const [selectedSolarDataSource, setSelectedSolarDataSource] = useState<string | null>(null);
	const [selectedEmail, setSelectedEmail] = useState('')
	const [emailVerified, setEmailVerified] = useState(false);
	const [notificationOptions, notificationOptionsHandlers] = useListState([
		{ label: 'system status', checked: true, index: 0 },
		{ label: 'system last production', checked: true, index: 1 },
	]);
	const [notificationOptionsVerified, setNotificationOptionsVerified] = useState(true);

	const notificationBoxes = notificationOptions.map((value, index) => (
		<Checkbox
			mt="xs"
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
				setEmailSentNotificationVisible(true);
			})
			.catch(error => {
				console.error('email send fail:', error);
			});
	}

	const checkEmailVerification = () => {
		fetch(`/api/email/verified?email=${selectedEmail}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		})
			.then(response => {
				if (!response.ok) {
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
	}

	useEffect(() => {
		if (notificationOptions.some((item) => item.checked)) {
			console.log("options valid");
			setNotificationOptionsVerified(true);
		} else {
			console.log("options not valid");
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


	return (
		<>
			<Space h="lg" />
			<Title order={5}>
				Solar Data
				{solarDataVerified && <IconCheck style={{ color: 'green', marginRight: '5px' }} />}
			</Title>
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
				<Text c="dimmed" size="sm">Systems to monitor...</Text>
			)}
			{systemsData && (
				<Card withBorder shadow="sm" radius="md" padding="lg">
					<Text component="pre" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
						{JSON.stringify(systemsData, null, 2)}
					</Text>
				</Card>
			)}

			<Space h="lg" />
			<Title order={5}>
				Email
				{emailVerified && <IconCheck style={{ color: 'green', marginRight: '5px' }} />}
			</Title>
			{(emailNotificationVisible || emailSentNotificationVisible) && (
				<Space h="lg" />
			)}
			{emailNotificationVisible && (
				<Notification color="red" onClose={() => setEmailNotificationVisible(false)}>
					Email in system, but not verified yet. Follow link sent in email to verify email. Check spam folder if email not found.
				</Notification>
			)}
			{emailSentNotificationVisible && (
				<Notification color="green" onClose={() => setEmailSentNotificationVisible(false)}>
					Verification email sent successfully! Check your spam folder.
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
			<Title order={5}>
				Notification Rules
				{(notificationOptionsVerified && emailVerified) && <IconCheck style={{ color: 'green', marginRight: '5px' }} />}
			</Title>
			<Text c="dimmed" size="sm">Rules are evaluated hourly for each system.</Text>
			<Text c="dimmed" size="sm">Production alerts occur if last production is older than 24h.</Text>
			<Space h="md" />
			<Stack>
				{notificationBoxes}
			</Stack>

			<Space h="md" />
			<div style={{ marginTop: '20px' }}>
				<Button disabled={!emailVerified || !notificationOptionsVerified} onClick={authSolarData} color="green">
					submit
				</Button>
			</div>
		</>
	);
}
