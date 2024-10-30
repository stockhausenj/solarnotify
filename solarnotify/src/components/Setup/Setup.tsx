import { Button, Select, TextInput } from '@mantine/core';
import classes from './Setup.module.css';

export function Setup() {
	const handleInitiateSetup = () => {
		console.log("SETUP LLOL OMG")
	}

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
		</>
	);
}
