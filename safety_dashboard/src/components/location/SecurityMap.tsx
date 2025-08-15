// Server wrapper for the client-only map to avoid importing Leaflet during SSR
import dynamic from 'next/dynamic';

const SecurityMapClient = dynamic(() => import('./SecurityMapClient'), { ssr: false });

export default function SecurityMap(props: any) {
  return <SecurityMapClient {...props} />;
}
