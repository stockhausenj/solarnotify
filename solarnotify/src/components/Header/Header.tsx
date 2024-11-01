import { Container, Group, Text, Anchor } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import classes from './Header.module.css';

export function Header() {
  return (
    <>
      <header className={classes.header}>
        <Container size="md" className={classes.inner}>
          <Text size="xl" fw={700}>
            SolarNotify
          </Text>

          <Group>
            <Anchor href={'https://github.com/stockhausenj/solarnotify'} target="_blank" rel="noopener noreferrer" c="dark">
              <IconBrandGithub size={40} />
            </Anchor>
          </Group>
        </Container>
      </header>
    </>
  );
}
