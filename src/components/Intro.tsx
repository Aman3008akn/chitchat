import React from 'react';
import './Intro.css';

const Intro: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <div className={`intro-container ${!show ? 'fade-out' : ''}`}>
      <div className="particles"></div>
      <div className="content">
        <h1 className="title">ChitChat</h1>
        <p className="subtitle">(By Aman Shukla)</p>
      </div>
    </div>
  );
};

export default Intro;
