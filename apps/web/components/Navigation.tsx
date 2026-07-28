"use client";

import { useState } from "react";

type NavigationProps = {
  cartCount: number;
  onCartOpen: () => void;
};

export function Navigation({ cartCount, onCartOpen }: NavigationProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Dubai Hikers home">
        <span className="brand-wordmark">DUBAI<span aria-hidden="true">/</span>HIKERS</span>
        <small>GUIDED MOUNTAIN HIKES</small>
      </a>
      <nav id="primary-navigation" className={open ? "nav-links open" : "nav-links"} aria-label="Main navigation">
        <a href="#events" onClick={() => setOpen(false)}>Hikes</a>
        <a href="#services" onClick={() => setOpen(false)}>Services</a>
        <a href="#about" onClick={() => setOpen(false)}>About</a>
        <a href="#reviews" onClick={() => setOpen(false)}>Stories</a>
      </nav>
      <button className="cart-button" onClick={onCartOpen} aria-label={`Open tickets, ${cartCount} selected`}>
        Tickets <span>{cartCount}</span>
      </button>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="primary-navigation">
        {open ? "Close" : "Menu"}
      </button>
    </header>
  );
}
