
import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
  const [version, setVersion] = useState<string | null>(null);
  
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/health`);
        setStatus("online");
        setVersion(response.data.version);
      } catch (error) {
        console.error("API health check failed:", error);
        setStatus("offline");
      }
    };
    
    checkApiStatus();
    
    // Check status every minute
    const interval = setInterval(checkApiStatus, 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (status === "checking") {
    return (
      <div className="flex items-center text-xs text-muted-foreground">
        <span className="animate-pulse mr-1">●</span> Checking API...
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-xs">
      {status === "online" ? (
        <div className="flex items-center text-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>API Online {version && `(v${version})`}</span>
        </div>
      ) : (
        <div className="flex items-center text-red-500">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>API Offline</span>
        </div>
      )}
    </div>
  );
}
