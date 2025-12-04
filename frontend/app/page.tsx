'use client';

import ChatInterface from '../components/ChatInterface.js';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI Mental Coach
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your supportive companion for stress, motivation, habits, and confidence
          </p>
        </div>
        <ChatInterface />
      </div>
    </main>
  );
}

