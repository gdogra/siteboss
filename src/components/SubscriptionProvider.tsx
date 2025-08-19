
import React from 'react';
import { SubscriptionContext, useSubscriptionManager } from '@/hooks/useSubscription';

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const subscriptionData = useSubscriptionManager();

  return (
    <SubscriptionContext.Provider value={subscriptionData}>
      {children}
    </SubscriptionContext.Provider>);

};

export default SubscriptionProvider;