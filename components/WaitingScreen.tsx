import React from 'react';

const WaitingScreen = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="py-6 px-4 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-[#82dee4] text-3xl font-bold">AI Coach</div>
          <button className="text-black bg-gray-100 px-4 py-2 rounded-full text-sm hover:bg-gray-200">
            Help?
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-[#82dee4]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-[#82dee4] border-t-transparent animate-spin"></div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-black mb-3">Setting up your interview...</h1>
            <p className="text-gray-600">Preparing personalized questions based on your resume</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WaitingScreen;