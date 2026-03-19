'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { subscribeChannel, unsubscribeChannel } from '@/app/actions/channels';

interface SubscribeButtonProps {
  uid: string;
  channelId: string;
  initialSubscribed: boolean;
}

export default function SubscribeButton({
  uid,
  channelId,
  initialSubscribed,
}: SubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      if (subscribed) {
        await unsubscribeChannel(uid, channelId);
        setSubscribed(false);
      } else {
        await subscribeChannel(uid, channelId);
        setSubscribed(true);
      }
    } catch {
      // Silently revert on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="gold" loading={loading} onClick={handleToggle}>
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  );
}
