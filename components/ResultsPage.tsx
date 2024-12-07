import React from 'react';

interface Answer {
  question: string;
  answer: string;
  feedback?: string;
}

interface ResultsPageProps {
  answers: Answer[];
  onRestart: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ answers, onRestart }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-8">Interview Results</h1>
          
          {answers.map((answer, index) => (
            <div key={index} className="mb-12 last:mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Question {index + 1}:
              </h2>
              <div className="mb-4">
                <p className="text-gray-700">{answer.question}</p>
              </div>
              
              <h3 className="font-medium mb-2">Your Answer:</h3>
              <div className="mb-6">
                <p className="text-gray-700">{answer.answer}</p>
              </div>
              
              {answer.feedback && (
                <>
                  <h3 className="font-medium mb-2">Feedback:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {answer.feedback}
                    </p>
                  </div>
                </>
              )}

              {index < answers.length - 1 && (
                <hr className="my-8 border-gray-200" />
              )}
            </div>
          ))}
          
          <button
            onClick={onRestart}
            className="w-full mt-8 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;