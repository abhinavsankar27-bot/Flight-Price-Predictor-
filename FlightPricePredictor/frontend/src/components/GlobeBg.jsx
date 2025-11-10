import React, { useEffect, useRef } from "react";
import Globe from "react-globe.gl";

export default function GlobeBg() {
  const globeEl = useRef();

  useEffect(() => {
    // basic globe config
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.4;
  }, []);

  return (
    <div className="absolute inset-0 -z-10 opacity-70">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundColor="rgba(0,0,0,0)"
        width={window.innerWidth}
        height={window.innerHeight}
        showAtmosphere={true}
      />
    </div>
  );
}
