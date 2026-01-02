import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { Network } from "@capacitor/network";

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    let networkListener: any = null;

    const setupMobile = async () => {
      // Check if running on mobile
      setIsMobile(Capacitor.isNativePlatform());

      // Get device info
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        setDeviceInfo(info);
      }

      // Monitor network status
      const status = await Network.getStatus();
      setIsOnline(status.connected);

      // Listen for network changes
      networkListener = await Network.addListener(
        "networkStatusChange",
        (status) => {
          setIsOnline(status.connected);
        }
      );
    };

    setupMobile();

    return () => {
      if (networkListener) {
        networkListener.remove();
      }
    };
  }, []);

  return {
    isMobile,
    isOnline,
    deviceInfo,
    platform: deviceInfo?.platform || "web",
  };
}
