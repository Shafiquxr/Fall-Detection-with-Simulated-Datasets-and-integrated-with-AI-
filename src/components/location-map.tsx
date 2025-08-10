'use client';

import type { FC } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LocationMap: FC = () => {
  // Default position: Chennai, India
  const position = { lat: 12.9716, lng: 80.0431 };

  const boundingBox = {
    minLng: position.lng - 0.01,
    minLat: position.lat - 0.01,
    maxLng: position.lng + 0.01,
    maxLat: position.lat + 0.01,
  };

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${boundingBox.minLng}%2C${boundingBox.minLat}%2C${boundingBox.maxLng}%2C${boundingBox.maxLat}&layer=mapnik&marker=${position.lat}%2C${position.lng}`;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          <span>Last Known Location</span>
        </CardTitle>
        <CardDescription>User's location based on the wearable device.</CardDescription>
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
