import React from 'react';


const Footer: React.FC = () => {
  return (
    <footer style={{ textAlign: 'center', fontWeight: 'bold', color: '#6892d5', }}>

      <p>&copy; {new Date().getFullYear()} LOKI & DLR </p>

    </footer>
  );
};

export default Footer;




