import React, { ReactNode } from 'react';
import { useSubscriptionManager, SubscriptionContext } from '@/hooks/useSubscription';

interface SubscriptionProviderProps {
  children: ReactNode;
}

const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const subscriptionManager = useSubscriptionManager();

  return (
    <SubscriptionContext.Provider value={subscriptionManager}>
      {children}
    </SubscriptionContext.Provider>);

};

export default SubscriptionProvider;