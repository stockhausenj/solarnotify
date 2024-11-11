import '@mantine/core/styles.css';
import { MantineProvider, Grid, Container, Tabs } from '@mantine/core';

import logo from './assets/logo.png';
import './App.css';
import { Header } from './components/Header/Header';
import { Banner } from './components/Banner/Banner';
import { Welcome } from './components/Welcome/Welcome';
import { Setup } from './components/Setup/Setup';
import { Disable } from './components/Disable/Disable';
import { Footer } from './components/Footer/Footer';
import { LiveData } from './components/LiveData/LiveData';

export default function App() {

  return (
    <MantineProvider
      defaultColorScheme='dark'
    >
      <Header />
      <Container my="md">
        <Grid>
          <Grid.Col span={{ base: 12, xs: 12 }}>
            <Banner />
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={{ base: 12, xs: 12 }}>
            <Welcome />
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={{ base: 12, xs: 5 }}>
            <img src={logo} className="logo" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, xs: 7 }}>
            <Tabs defaultValue="Setup">
              <Tabs.List>
                <Tabs.Tab value="Setup" size={200}>
                  Setup
                </Tabs.Tab>
                <Tabs.Tab value="Disable">
                  Disable
                </Tabs.Tab>
                <Tabs.Tab value="Live Data">
                  Live Data (experimental)
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="Setup">
                <Setup />
              </Tabs.Panel>
              <Tabs.Panel value="Disable">
                <Disable />
              </Tabs.Panel>
              <Tabs.Panel value="Live Data">
                <LiveData />
              </Tabs.Panel>
            </Tabs>
          </Grid.Col>
        </Grid>
      </Container>
      <Footer />
    </ MantineProvider>
  )
}
