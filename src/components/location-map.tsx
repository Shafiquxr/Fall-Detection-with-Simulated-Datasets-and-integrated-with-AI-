'use client';

import type { FC } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { MapPin, WifiOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LocationMap: FC = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // Default position: San Francisco, CA
  const position = { lat: 37.7749, lng: -122.4194 };

  if (!apiKey) {
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
          <div className="flex flex-col items-center justify-center h-[350px] bg-muted rounded-lg p-8 text-center">
            <WifiOff className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg">Map Unavailable</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
             Last known coordinates: {position.lat}, {position.lng}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
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
            <Map
              defaultCenter={position}
              defaultZoom={14}
              mapId="guardian-angel-map-1"
              gestureHandling={'greedy'}
              disableDefaultUI={true}
            >
              <Marker position={position} />
            </Map>
          </div>
        </CardContent>
      </Card>
    </APIProvider>
  );
};
