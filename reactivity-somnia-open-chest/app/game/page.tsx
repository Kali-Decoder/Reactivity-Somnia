"use client";

import { useEffect } from "react";

export default function GamePage() {
  useEffect(() => {
    // Redirect to home page (game is now on root)
    window.location.href = "/";
  }, []);

  return null;
}
