import { Title, Space } from '@mantine/core';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';

export function LiveData() {
  type ChartData = {
    name: string;
    count: number;
  };

  const [data, setData] = useState<ChartData[]>([]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/livedata/status');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Space h="lg" />
      <Title order={5}>
        Solar System Status
      </Title>
      <Space h="lg" />
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="systems" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}
