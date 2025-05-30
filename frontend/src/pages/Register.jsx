import React from 'react';

const Register = () => {
  return (
    <div>
      <h1>Register</h1>
      <form>
        <input type="text" placeholder="Account" />
        <input type="password" placeholder="Password" />
        <input type="password" placeholder="Confirm Password" />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register; 