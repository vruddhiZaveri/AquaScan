import { useEffect, useState } from "react";

export function useLocation() {
  const [coords, setCoords] = useState(null);
  const [locName, setLocName] = useState("Location unavailable");

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocName("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCoords(c);
        setLocName(`${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}`);
      },
      () => {
        setLocName("Mumbai, India");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  return { coords, locName };
}
