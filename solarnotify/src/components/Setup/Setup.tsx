import React, { useEffect, useState } from 'react';
import { Button, Select, TextInput, Loader } from '@mantine/core';
import classes from './Setup.module.css';

export function Setup() {
	const [loading, setLoading] = useState(false);

	const currentHostname = window.location.hostname;
	const currentPort = window.location.port;
	const redirectUri = `${window.location.protocol}//${currentHostname}${currentPort ? `:${currentPort}` : ''}`;
	const clientId = 'eef7fb7a4aa9834d2988819df395a83c';

	const handleInitiateSetup = () => {

		const authEndpoint = 'https://api.enphaseenergy.com/oauth/authorize';

		const authUrl = `${authEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

		window.location.href = authUrl;
	};

	useEffect(() => {
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
			<TextInput label="Email address" placeholder="bob@gmail.com" classNames={classes} />

			<Select
				mt="md"
				comboboxProps={{ withinPortal: true }}
				data={['Enphase']}
				placeholder="Pick one"
				label="Solar data source"
				classNames={classes}
			/>

			<div style={{ marginTop: '20px' }}>
				<Button onClick={handleInitiateSetup} color="green">
					Initiate Setup
				</Button>
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
