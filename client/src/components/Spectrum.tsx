import React from "react";

interface SpectrumProps {
  spectrum: number[];
  name: string;
  alive: boolean;
}

const Spectrum: React.FC<SpectrumProps> = ({ spectrum, name, alive }) => (
  <div className={`spectrum-container ${alive ? "" : "spectrum-dead"}`}>
    <div className="spectrum">
      {spectrum.map((height, i) => (
        <div key={i} className="spectrum-col">
          <div
            className="spectrum-bar"
            style={{ height: `${(height / 20) * 100}%` }}
          />
        </div>
      ))}
    </div>
    <div className="spectrum-name">
      {name} {alive ? "" : "💀"}
    </div>
  </div>
);

export default Spectrum;
