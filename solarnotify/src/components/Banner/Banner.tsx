import { useState } from 'react';
import { Notification, Space } from '@mantine/core';

export function Banner() {
  const [notificationVisible, setNotificationVisible] = useState(true);

  return (
    <>
      {(notificationVisible) && (
        <Space h="md" />
      )}
      {notificationVisible && (
        <Notification color="blue" onClose={() => setNotificationVisible(false)}>
          This site is new. Contact jay.stockhausen@solarnotify.com with any questions.
        </Notification>
      )}
    </>
  );
}
