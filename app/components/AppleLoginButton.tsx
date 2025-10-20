"use client";
// import { loginWithApple } from 'app/backend/actions/index'

export default function AppleLoginButton() {
  const handleLogin = async () => {
    // await loginWithApple()
  };

  return (
    <button
      className="bg-green-500 text-white px-4 py-2 rounded-md"
      onClick={handleLogin}
    >
      Login with Apple
    </button>
  );
}
