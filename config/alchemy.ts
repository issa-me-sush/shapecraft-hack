import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react";
import { sepolia, alchemy , arbitrumSepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email" }],
      [
        { type: "passkey" },
        { type: "social", authProviderId: "google", mode: "popup" }
      ],
      [
        {
          type: "external_wallets",
          walletConnect: { projectId: "71c548caa10d661627b474b0f7bd4dd6" }
        }
      ]
    ],
    addPasskeyOnSignup: true,
  },
};

export const config = createConfig({
  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
  chain: arbitrumSepolia,
  ssr: true,
  enablePopupOauth: true,
}, uiConfig);

export const queryClient = new QueryClient();