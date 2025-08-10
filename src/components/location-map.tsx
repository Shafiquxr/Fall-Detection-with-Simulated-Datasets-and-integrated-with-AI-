'use client';

import type { FC } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Location } from '@/lib/types';

interface LocationMapProps {
  location: Location | null;
}

const DEFAULT_LOCATION = { lat: 12.985, lng: 80.03 }; // Centered between Kundrathur and Sriperumbudur

export const LocationMap: FC<LocationMapProps> = ({ location }) => {
  const position = location || DEFAULT_LOCATION;
  const isFallDetected = !!location;

  const boundingBox = {
    minLng: position.lng - 0.01,
    minLat: position.lat - 0.01,
    maxLng: position.lng + 0.01,
    maxLat: position.lat + 0.01,
  };

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${boundingBox.minLng}%2C${boundingBox.minLat}%2C${boundingBox.maxLng}%2C${boundingBox.maxLat}&layer=mapnik${isFallDetected ? `&marker=${position.lat}%2C${position.lng}`: ''}`;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          <span>{isFallDetected ? 'Fall Detected At' : 'Last Known Location'}</span>
        </CardTitle>
        <CardDescription>
          {isFallDetected ? "User's location at the time of the fall." : "User's location based on the wearable device."} <br />
          <span className="font-mono text-xs">
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </span>
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
