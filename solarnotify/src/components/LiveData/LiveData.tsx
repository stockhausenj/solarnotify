import { Space } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function LiveData() {
	// Define the type for our data
	type ChartData = {
		name: string;
		count: number;
	};

	// Sample data for the chart
	const data: ChartData[] = [
		{ name: 'Page A', count: 400 },
		{ name: 'Page B', count: 300 },
		{ name: 'Page C', count: 200 },
		{ name: 'Page D', count: 278 },
		{ name: 'Page E', count: 189 },
	];
	return (
		<>
			<Space h="lg" />
			<ResponsiveContainer width="100%" height={400}>
				<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="count" fill="#8884d8" />
				</BarChart>
			</ResponsiveContainer>
		</>
	);
}
