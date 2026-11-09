import React from "react";
import BrandMark from "../components/BrandMark";
import { welcomeFeatures } from "../data/demoData";

export default function WelcomePage({ onAuth }) {
  return (
    <div className="welcome-shell">
      <header className="welcome-topbar">
        <a className="brand home-brand" href="/" aria-label="Routeflow home">
          <BrandMark />
          <span>routeflow</span>
        </a>
        <nav className="welcome-nav" aria-label="Main navigation">
          <a href="#welcome-overview">Platform</a>
          <a href="#welcome-benefits">Benefits</a>
          <a href="#welcome-contact">Get started</a>
        </nav>
        <div className="welcome-actions">
          <button
            className="ghost-btn"
            type="button"
            onClick={() => onAuth("login")}
          >
            Sign in
          </button>
          <button
            className="primary-btn"
            type="button"
            onClick={() => onAuth("signup")}
          >
            Sign up
          </button>
        </div>
      </header>

      <main>
        <section className="welcome-content" id="welcome-overview">
          <div className="welcome-copy">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              LOGISTICS, WITHOUT THE GUESSWORK
            </span>
            <h1>
              Make every mile
              <span> work smarter.</span>
            </h1>
            <p>
              Bring orders, routes, drivers, and customer updates together in one
              clear view—and keep your operation moving when the unexpected happens.
            </p>
            <div className="welcome-cta-row">
              <button
                className="primary-btn welcome-cta"
                type="button"
                onClick={() => onAuth("signup")}
              >
                Get started
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 10h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <a className="welcome-secondary-link" href="#welcome-benefits">
                Explore the platform
              </a>
            </div>
            <div className="welcome-proof">
              <span className="proof-avatars" aria-hidden="true">
                <span>O</span>
                <span>D</span>
                <span>F</span>
              </span>
              <span>
                <strong>One connected operation</strong>
                <br />
                from the first scan to the final stop
              </span>
            </div>
          </div>

          <aside className="welcome-preview" aria-label="Routeflow operations preview">
            <div className="preview-orbit orbit-one" />
            <div className="preview-orbit orbit-two" />
            <div className="preview-card">
              <div className="preview-heading">
                <span className="preview-indicator" />
                <span>NETWORK OVERVIEW</span>
                <span className="preview-live">LIVE</span>
              </div>
              <div className="preview-map">
                <img
                  className="preview-image"
                  src="/images/freight-truck.jpg"
                  alt="Freight truck carrying a shipment on a rural road"
                />
                <span className="preview-image-caption">Newark to Brooklyn · In transit</span>
              </div>
              <div className="preview-summary">
                <div>
                  <span>Deliveries today</span>
                  <strong>1,284</strong>
                </div>
                <div>
                  <span>On-time rate</span>
                  <strong>96.8%</strong>
                </div>
              </div>
            </div>
            <div className="preview-note">
              <span className="preview-check">✓</span>
              <span>
                <strong>Route optimized</strong>
                <small>Saving 18 minutes</small>
              </span>
            </div>
          </aside>
        </section>

        <section className="welcome-operations-photo" aria-label="Warehouse operations">
          <div>
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              BUILT FOR THE REAL WORLD
            </span>
            <h2>From the warehouse to the doorstep.</h2>
            <p>Keep every handoff in view, from the first parcel scan to the final delivery.</p>
          </div>
          <img
            src="/images/delivery-hub.jpg"
            alt="A busy distribution warehouse filled with parcels ready to ship"
            loading="lazy"
          />
        </section>

        <section
          className="welcome-benefits"
          id="welcome-benefits"
          aria-labelledby="welcome-benefits-title"
        >
          <div className="welcome-benefits-heading">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              CLARITY AT EVERY STEP
            </span>
            <h2 id="welcome-benefits-title">A better view of your delivery day.</h2>
            <p>Less time chasing updates. More time keeping every delivery on track.</p>
          </div>
          <div className="welcome-feature-grid">
            {welcomeFeatures.map((feature, index) => (
              <article className="welcome-feature-card" key={feature.title}>
                <span className="welcome-feature-number">0{index + 1}</span>
                <span className="welcome-feature-icon" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="welcome-contact" id="welcome-contact">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              READY WHEN YOU ARE
            </span>
            <h2>Bring your delivery operation into focus.</h2>
          </div>
          <button
            className="primary-btn welcome-contact-cta"
            type="button"
            onClick={() => onAuth("signup")}
          >
            Create your account <span aria-hidden="true">→</span>
          </button>
        </section>
      </main>

      <footer className="welcome-footer">
        <span>© 2026 Routeflow Logistics</span>
        <a href="#welcome-overview">Back to top ↑</a>
      </footer>
    </div>
  );
}

