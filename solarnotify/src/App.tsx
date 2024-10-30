import '@mantine/core/styles.css';
import { MantineProvider, Grid, Container } from '@mantine/core';

import logo from './assets/logo.png'
import './App.css'
import { Setup } from './components/Setup/Setup'

export default function App() {

  return (
    <MantineProvider
      defaultColorScheme='dark'
    >
      <Container my="md">
        <Grid>
          <Grid.Col span={{ base: 12, xs: 5 }}>
            <img src={logo} className="logo" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 7 }}>
            <Setup />
          </Grid.Col>
        </Grid>
      </Container>
    </ MantineProvider>
  )
}
