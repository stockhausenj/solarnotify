import { useState } from 'react';
import { Title, Space, Button, TextInput } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import classes from './Disable.module.css';

export function Disable() {
  const [selectedEmail, setSelectedEmail] = useState('')
  const [disabled, setDisabled] = useState(false);

  const cleanup = () => {
    fetch(`/api/email/disable?email=${selectedEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error during cleanup: ${response.status}`)
        } else {
          return response.json();
        }
      })
      .then(data => {
        if (data.deleted) {
          setDisabled(true);
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
        {disabled && <IconCheck style={{ color: 'green', marginRight: '5px' }} />}
      </Title>

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
          remove monitoring
        </Button>
      </div>
    </>
  );
}
