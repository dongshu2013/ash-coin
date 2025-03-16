import React from 'react';

const TestLint = () => {
  // This should trigger a linting error
  console.log('This should trigger a linting error');

  return (
    <div>
      <h1>Test Lint</h1>
    </div>
  );
};

export default TestLint;
