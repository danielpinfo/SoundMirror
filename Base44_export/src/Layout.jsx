import React from 'react';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
}