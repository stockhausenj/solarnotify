import { Space, Text } from '@mantine/core';

export function Welcome() {
  return (
    <>
      <Text>Welcome!</Text>
      <Text>Learn about issues with your solar system faster.</Text>
      <Text>Receive an email alert when your system status changes or when the last detected energy production is older than 24 hours.</Text>
      <Space h="lg" />
    </>
  );
}
