import React from 'react';

// ============================================================
//  COMPONENT — Navbar
// ============================================================
const NAV_LINKS: [string, string][] = [
  ['hero', 'Accueil'],
  ['galerie', 'Photos'],
  ['timeline', 'Nos Moments'],
  ['message', 'Message'],
];

function Navbar(): React.JSX.Element {
  const scrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">Notre Histoire</div>
      <ul className="nav-links">
        {NAV_LINKS.map(([id, label]) => (
          <li key={id}>
            <a onClick={() => scrollTo(id)}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
