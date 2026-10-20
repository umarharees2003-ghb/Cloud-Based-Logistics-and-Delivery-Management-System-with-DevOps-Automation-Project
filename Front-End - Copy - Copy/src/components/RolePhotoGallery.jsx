import React from "react";
import { rolePhotoCollections } from "../data/demoData";

export default function RolePhotoGallery({ roleId }) {
  const collection = rolePhotoCollections[roleId];
  if (!collection) return null;

  return (
    <section className="role-photo-gallery" aria-label={collection.heading}>
      <div className="role-photo-gallery-heading">
        <div>
          <h2>{collection.heading}</h2>
          <p>{collection.description}</p>
        </div>
        <span>ROLE OVERVIEW</span>
      </div>
      <div className="role-photo-grid">
        {collection.photos.map((photo) => (
          <article className="role-photo-card" key={photo.title}>
            <img src={photo.image} alt={photo.alt} loading="lazy" decoding="async" />
            <div className="role-photo-card-copy">
              <h3>{photo.title}</h3>
              <p>{photo.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
