import React, { useState } from 'react';

const Onboarding = ({ onEmailSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onEmailSubmit(email);
  };

  return (
    <div>
      <h1>Welcome to the Bluetooth Connection Dashboard</h1>
      <p>Please enter your email address to get started:</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Onboarding;