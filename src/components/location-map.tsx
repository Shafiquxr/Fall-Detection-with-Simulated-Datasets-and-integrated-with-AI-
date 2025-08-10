'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LocationMap: FC = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // Default position: San Francisco, CA
  const position = { lat: 12.9716, lng: 80.0431 };

  const StaticMapFallback = () => (
    <div className="h-[350px] w-full rounded-lg overflow-hidden border relative">
      <Image 
        src={`https://placehold.co/800x400.png`}
        alt="Static map placeholder"
        fill
        className="object-cover"
        data-ai-hint="map city"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <div className="p-4 rounded-lg bg-background/80 text-center">
            <h3 className="font-semibold text-lg">Map Preview</h3>
            <p className="text-sm text-muted-foreground">
                Last known coordinates: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
             <p className="text-xs text-muted-foreground/80 mt-2">
                (Add a Google Maps API key for a live map)
            </p>
        </div>
      </div>
    </div>
  );

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
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
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
          </APIProvider>
        ) : (
          <StaticMapFallback />
        )}
      </CardContent>
    </Card>
  );
};
