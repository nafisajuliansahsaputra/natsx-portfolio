import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <Link href="/" className="site-logo" aria-label="NATSX home">
          <Image
            src="/images/branding/natsx-logo-black.png"
            alt="NATSX"
            width={1110}
            height={380}
            priority
            className="site-logo__image"
          />
        </Link>

        <nav className="site-nav" aria-label="Main navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#playground">Playground</a>
          <a href="#contact">Contact</a>
        </nav>

        <button
          className="site-menu-label"
          type="button"
          aria-label="Open navigation menu"
        >
          Menu
        </button>
      </div>
    </header>
  );
}