'use client';

import type { FC } from 'react';
import { MapPin, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Location, Caregiver } from '@/lib/types';

interface LocationMapProps {
  location: Location | null;
  caregivers: Caregiver[];
  isAlertActive: boolean;
}

const DEFAULT_LOCATION = { lat: 12.985, lng: 80.03 }; // Centered between Kundrathur and Sriperumbudur

export const LocationMap: FC<LocationMapProps> = ({ location, caregivers, isAlertActive }) => {
  const fallPosition = location;
  const isFallDetected = !!fallPosition;

  // Calculate bounds to include fall and all caregivers
  const calculateBounds = () => {
    if (!isFallDetected) return { minLng: DEFAULT_LOCATION.lng - 0.05, minLat: DEFAULT_LOCATION.lat - 0.05, maxLng: DEFAULT_LOCATION.lng + 0.05, maxLat: DEFAULT_LOCATION.lat + 0.05 };

    const points = [fallPosition, ...caregivers.map(c => c.location)];
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);

    return {
      minLat: Math.min(...lats) - 0.01,
      maxLat: Math.max(...lats) + 0.01,
      minLng: Math.min(...lngs) - 0.01,
      maxLng: Math.max(...lngs) + 0.01,
    };
  };

  const boundingBox = calculateBounds();

  const markers = [];
  if (isFallDetected) {
    markers.push(`marker=${fallPosition.lat},${fallPosition.lng}`);
  }
  if (isAlertActive) {
    caregivers.forEach(cg => {
        markers.push(`marker=icon:blue-dot|${cg.location.lat},${cg.location.lng}`)
    })
  }
  
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${boundingBox.minLng}%2C${boundingBox.minLat}%2C${boundingBox.maxLng}%2C${boundingBox.maxLat}&layer=mapnik${markers.length > 0 ? `&${markers.join('&')}`: ''}`;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          <span>{isFallDetected ? 'Fall Detected At' : 'Last Known Location'}</span>
        </CardTitle>
        <CardDescription>
          {isFallDetected ? "User's location at the time of the fall." : "User's location based on the wearable device."} <br />
          {fallPosition && <span className="font-mono text-xs">
            {fallPosition.lat.toFixed(4)}, {fallPosition.lng.toFixed(4)}
          </span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full rounded-lg overflow-hidden border">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            src={mapUrl}
            title="OpenStreetMap location"
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
};
