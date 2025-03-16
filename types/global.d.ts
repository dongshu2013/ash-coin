interface PhantomProvider {
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: string }>;
    disconnect: () => Promise<void>;
  };
}

interface Window {
  phantom?: PhantomProvider;
}
