import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = document.cookie.includes("session");
    if (!session) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  return { isAuthenticated };
}
