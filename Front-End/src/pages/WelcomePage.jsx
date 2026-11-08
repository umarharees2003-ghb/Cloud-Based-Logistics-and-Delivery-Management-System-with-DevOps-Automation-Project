import React, { useEffect, useState } from "react";
import BrandMark from "../components/BrandMark";
import { welcomeFeatures } from "../data/demoData";

export default function WelcomePage({ onAuth }) {
  const [allowMotion, setAllowMotion] = useState(() =>
    typeof window === "undefined"
      ? true
      : !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [videoAvailable, setVideoAvailable] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = (event) => setAllowMotion(!event.matches);

    mediaQuery.addEventListener("change", updateMotionPreference);
    return () => mediaQuery.removeEventListener("change", updateMotionPreference);
  }, []);

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
          <div className="welcome-hero-media" aria-hidden="true">
            {allowMotion && videoAvailable && (
              <video
                className="welcome-hero-video"
                autoPlay
                muted
                loop
                playsInline
                poster="/images/logistics-truck.webp"
                preload="metadata"
                onError={() => setVideoAvailable(false)}
              >
                <source src="/videos/logistics-hero.mp4" type="video/mp4" />
              </video>
            )}
          </div>
          <div className="welcome-copy">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              LOGISTICS, WITHOUT THE GUESSWORK
            </span>
            <h1>
              Delivering a smarter
              <span className="welcome-accent"> tomorrow.</span>
            </h1>
            <p>
              One connected platform for deliveries, drivers, fleet operations and shipment management.
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

          <aside className="welcome-preview" aria-label="Routeflow platform illustration">
            <div className="preview-orbit orbit-one" />
            <div className="preview-orbit orbit-two" />
            <div className="preview-card">
              <div className="preview-heading">
                <span className="preview-indicator" />
                <span>PLATFORM OVERVIEW</span>
                <span className="preview-live">PREVIEW</span>
              </div>
              <div className="preview-map">
                <img
                  className="preview-image"
                  src="/images/logistics-truck.webp"
                  srcSet="/images/logistics-truck-800.webp 800w, /images/logistics-truck.webp 1400w"
                  sizes="(max-width: 760px) 90vw, 440px"
                  alt="A white freight truck and trailer traveling on a highway at sunset"
                  width="1400"
                  height="2099"
                  fetchPriority="high"
                  decoding="async"
                />
                <span className="preview-image-caption">Connected routes, from hub to doorstep</span>
              </div>
              <div className="preview-summary">
                <div>
                  <span>Connected workspaces</span>
                  <strong>5 roles</strong>
                </div>
                <div>
                  <span>Delivery visibility</span>
                  <strong>End to end</strong>
                </div>
              </div>
            </div>
            <div className="preview-note">
              <span className="preview-check">✓</span>
              <span>
                <strong>Every handoff connected</strong>
                <small>Dispatch to delivery</small>
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
            src="/images/logistics-warehouse.webp"
            srcSet="/images/logistics-warehouse-800.webp 800w, /images/logistics-warehouse.webp 1400w"
            sizes="(max-width: 760px) 90vw, 600px"
            alt="Distribution warehouse with shelves of parcels and yellow storage bins"
            width="1400"
            height="934"
            loading="lazy"
            decoding="async"
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
          <ul className="welcome-capabilities" aria-label="Routeflow platform capabilities">
            <li>Delivery management</li>
            <li>Shipment status tracking</li>
            <li>Driver and fleet coordination</li>
            <li>Analytics and operational reporting</li>
            <li>Role-based dashboards</li>
            <li>Docker-ready operations platform</li>
          </ul>
        </section>

        <section className="welcome-workflow" aria-labelledby="welcome-workflow-title">
          <div className="welcome-workflow-heading">
            <span className="eyebrow dark-eyebrow">
              <span className="eyebrow-dot" />
              FROM BOOKING TO COMPLETION
            </span>
            <h2 id="welcome-workflow-title">How Routeflow works</h2>
          </div>
          <ol className="welcome-workflow-grid">
            <li>
              <span>01</span>
              <strong>Create a shipment</strong>
              <p>Enter delivery details and prepare the shipment for dispatch.</p>
            </li>
            <li>
              <span>02</span>
              <strong>Assign a driver</strong>
              <p>Coordinate the right driver and vehicle for the route.</p>
            </li>
            <li>
              <span>03</span>
              <strong>Update and track status</strong>
              <p>Keep the delivery status current as it moves through operations.</p>
            </li>
            <li>
              <span>04</span>
              <strong>Confirm completion</strong>
              <p>Close the delivery when the shipment reaches its destination.</p>
            </li>
          </ol>
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
