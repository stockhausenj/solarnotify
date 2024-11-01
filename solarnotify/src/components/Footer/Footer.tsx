import { Text, Group } from '@mantine/core';
import classes from './Footer.module.css';

export function Footer() {
  return (
    <>
      <div className={classes.footer}>
        <div className={classes.inner}>
          <Group gap="xs" justify="center" grow>
            <Text size="xs">@ 2024 solarnotify.com. All rights reserved.</Text>
            <Text size="xs">contact: jay.stockhausen@solarnotify.com</Text>
          </Group>
        </div>
      </div>
    </>
  );
}
