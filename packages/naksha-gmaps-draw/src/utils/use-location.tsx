import { useState, useEffect } from "react";

const defaultSettings = {
  enableHighAccuracy: false,
  timeout: Infinity,
  maximumAge: 0,
};

export const usePosition = (watch, settings = defaultSettings) => {
  const [position, setPosition] = useState<any>();
  const [error, setError] = useState<any>();

  const onChange = ({ coords }: any) => {
    setPosition([coords.longitude, coords.latitude]);
  };

  const onError = (error) => {
    setError(error.message);
  };

  useEffect(() => {
    if (!navigator || !navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    let watcher: any = null;
    if (watch) {
      watcher = navigator.geolocation.watchPosition(
        onChange,
        onError,
        settings
      );
    } else {
      watcher && navigator.geolocation.clearWatch(watcher);
    }

    return () => watcher && navigator.geolocation.clearWatch(watcher);
  }, [settings, watch]);

  return { position, error };
};
