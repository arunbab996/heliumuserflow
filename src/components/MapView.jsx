import { useEffect, useRef } from 'react'
import L from 'leaflet'

const HOUSE_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 7V15H10.5V10.5H5.5V15H1V7L8 1Z" fill="currentColor"/></svg>`
const LOCK_SVG = `<svg width="8" height="9" viewBox="0 0 8 9" fill="none"><rect x="1" y="4" width="6" height="5" rx="1" fill="white"/><path d="M2.5 4V3a1.5 1.5 0 013 0v1" stroke="white" stroke-width="1.2" stroke-linecap="round"/></svg>`

function markerHtml(status) {
  const isOccupied = status === 'occupied'
  const bg = isOccupied ? '#a8a29e' : status === 'reserved' ? '#d97706' : '#1c1917'
  return `
    <div style="
      width:34px; height:34px; border-radius:50%;
      background:${bg}; border:2.5px solid white;
      box-shadow:0 2px 10px rgba(0,0,0,0.22);
      display:flex; align-items:center; justify-content:center;
      color:white; position:relative; cursor:pointer;
      opacity:${isOccupied ? '0.7' : '1'};
      transition:transform 0.15s;
    ">
      ${HOUSE_SVG}
      ${isOccupied ? `<div style="position:absolute;top:-4px;right:-4px;background:#78716c;border-radius:50%;width:14px;height:14px;display:flex;align-items:center;justify-content:center;border:2px solid white;">${LOCK_SVG}</div>` : ''}
    </div>
  `
}

export default function MapView({ listings, selectedId, onSelectListing }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    if (mapRef.current) return
    const map = L.map(containerRef.current, {
      center: [12.9698, 77.7499],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    })

    L.tileLayer(
      `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`,
      {
        attribution: '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        tileSize: 512,
        zoomOffset: -1,
        maxZoom: 22,
      }
    ).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapRef.current = map
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.remove())
    markersRef.current = {}

    listings.forEach(listing => {
      const icon = L.divIcon({
        html: markerHtml(listing.status),
        className: '',
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      })

      const marker = L.marker([listing.lat, listing.lng], { icon })

      const popupHtml = `
        <div style="padding:12px 14px; min-width:160px; font-family:Inter,sans-serif;">
          <div style="font-size:11px;color:#78716c;margin-bottom:2px;">${listing.society}</div>
          <div style="font-size:14px;font-weight:600;color:#1c1917;">₹${(listing.rent/1000).toFixed(0)}K/mo</div>
          <div style="font-size:11px;color:#78716c;margin-top:2px;">${listing.bhk} · ${listing.sqft.toLocaleString()} sqft</div>
          <div style="margin-top:8px;">
            <span style="font-size:10px;padding:2px 8px;border-radius:20px;font-weight:600;background:${listing.status === 'available' ? '#0D9488' : listing.status === 'reserved' ? '#d97706' : '#78716c'};color:white;">${listing.badge}</span>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml, { closeButton: false, offset: [0, -10] })
      marker.on('click', () => onSelectListing && onSelectListing(listing.id))
      marker.addTo(map)
      markersRef.current[listing.id] = marker
    })
  }, [listings])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedId) return
    const marker = markersRef.current[selectedId]
    if (marker) {
      marker.openPopup()
      map.panTo(marker.getLatLng(), { animate: true, duration: 0.5 })
    }
  }, [selectedId])

  return <div ref={containerRef} className="w-full h-full" />
}
