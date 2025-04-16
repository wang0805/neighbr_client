"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

const OneMap = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const filters = useAppSelector((state) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  useEffect(() => {
    if (!mapContainerRef.current || isLoading || isError || !properties) return;

    const center: [number, number] = filters.coordinates
      ? [filters.coordinates[1], filters.coordinates[0]]
      : [103.8407909, 1.3668579]; // Singapore's center default

    const map = L.map(mapContainerRef.current).setView(center, 13);

    L.tileLayer(
      "https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        detectRetina: true,
        attribution:
          '<img src="https://www.onemap.gov.sg/web-assets/images/logo/om_logo.png" style="height:20px;width:20px;" /> ' +
          '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> ' +
          '&copy; contributors | <a href="https://www.sla.gov.sg/" target="_blank" rel="noopener noreferrer">Singapore Land Authority</a>',
      }
    ).addTo(map);

    properties.forEach((property: Property) => {
      const lat = property.location.coordinates.latitude;
      const lng = property.location.coordinates.longitude;

      if (lat == null || lng == null) return;

      const marker = L.marker([lat, lng]).addTo(map);

      const popupHTML = `
      <div class="popup-card">
        <div class="popup-image"></div>
        <div class="popup-content">
          <a href="/search/${property.id}" target="_blank" class="popup-title">${property.name}</a>
          <p class="popup-price">$${property.pricePerMonth}<span class="popup-unit"> / month</span></p>
        </div>
      </div>
    `;
      marker.bindPopup(popupHTML);
    });

    // Ensure map resizes properly
    setTimeout(() => map.invalidateSize(), 700);

    // ✅ Proper cleanup
    return () => {
      map.remove();
    };
  }, [isLoading, isError, properties, filters.coordinates]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <svg
          className="animate-spin h-8 w-8 text-primary-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
    );
  }
  if (isError || !properties) return <div>Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        ref={mapContainerRef}
        className="map-container rounded-xl"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

export default OneMap;
