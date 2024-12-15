import { useAuthModal, useUser, useLogout } from "@account-kit/react";

export default function Home() {
  const { openAuthModal } = useAuthModal();
  const {logout } = useLogout();
  const user = useUser();

  console.log("User:", user);

  return (
    <div className="min-h-screen flex items-center justify-center gap-4">
      {user ? (
        <>
          <div className="px-8 py-3 rounded-full bg-gray-600 text-white font-medium">
            {user.address.slice(0, 6)}...{user.address.slice(-4)}
          </div>
          <button
            onClick={logout}
            className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            console.log("Button clicked");
            openAuthModal();
          }}
          className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}