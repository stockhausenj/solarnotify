import { useState } from 'react';
import { Notification, Title, Space, Button, TextInput } from '@mantine/core';
import classes from './Disable.module.css';

export function Disable() {
  const [selectedEmail, setSelectedEmail] = useState('')
  const [disabledNotificationVisible, setDisabledNotificationVisible] = useState(false);
  const [disabledNotificationErrorVisible, setDisabledNotificationErrorVisible] = useState(false);

  const cleanup = () => {
    fetch(`/api/email/disable?email=${selectedEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (!response.ok) {
          setDisabledNotificationErrorVisible(true);
          throw new Error(`HTTP error during cleanup: ${response.status}`)
        } else {
          return response.json();
        }
      })
      .then(data => {
        if (data.deleted) {
          setDisabledNotificationVisible(true);
        } else {
          setDisabledNotificationErrorVisible(true);
        }
      })
      .catch(error => {
        console.error("error during cleanup", error);
      })
  }

  return (
    <>
      <Space h="lg" />
      <Title order={5}>
        Email
      </Title>
      {(disabledNotificationVisible || disabledNotificationErrorVisible) && (
        <Space h="md" />
      )}
      {disabledNotificationVisible && (
        <Notification color="green" onClose={() => setDisabledNotificationVisible(false)}>
          Successfully removed from system.
        </Notification>
      )}
      {disabledNotificationErrorVisible && (
        <Notification color="red" onClose={() => setDisabledNotificationErrorVisible(false)}>
          Email not found or error during cleanup.
        </Notification>
      )}
      <Space h="md" />
      <TextInput
        value={selectedEmail}
        onChange={(event) => {
          setSelectedEmail(event.currentTarget.value)
        }}
        label="email address"
        placeholder="bob@gmail.com"
        classNames={classes}
      />
      <div style={{ marginTop: '20px' }}>
        <Button onClick={cleanup} color="green" loaderProps={{ type: 'dots' }}>
          submit
        </Button>
      </div>
    </>
  );
}
