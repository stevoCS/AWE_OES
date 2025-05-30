import React from 'react';

const Login = () => {
  return (
    <div>
      <h1>Login</h1>
      <form>
        <input type="text" placeholder="Account" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login; 