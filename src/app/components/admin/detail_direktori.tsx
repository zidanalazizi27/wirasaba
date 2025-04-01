import React, { useEffect, useRef } from 'react';
import AddLocationRoundedIcon from '@mui/icons-material/AddLocationRounded';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import dynamic from 'next/dynamic';
import { renderToString } from 'react-dom/server';

const DetailDirektori = () => {
  const mapRef = useRef(null);
  
  useEffect(() => {
    // Memastikan leaflet hanya dijalankan di client-side
    if (typeof window !== 'undefined') {
      // Async import Leaflet untuk client-side rendering
      const loadMap = async () => {
        const L = (await import('leaflet')).default;
        // Pastikan CSS Leaflet dimuat
        await import('leaflet/dist/leaflet.css');
        
        // Koordinat dari data
        const latitude = -7.412928;
        const longitude = 112.707911;
        
        // Render Material-UI icon ke string SVG
        const iconSVG = renderToString(
          <AddLocationRoundedIcon
            style={{ 
              color: '#E52020', 
              fontSize: 30,
              filter: 'drop-shadow(0px 3px 3px rgba(0, 0, 0, 1))',
            }} 
          />
        );
        
        if (mapRef.current && !mapRef.current._leaflet_id) {
            const map = L.map(mapRef.current, {
              dragging: true,          // Aktifkan dragging/dapat digeser
              zoomControl: true,       // Tampilkan kontrol zoom
              scrollWheelZoom: true,   // Aktifkan zoom dengan scroll mouse
              doubleClickZoom: true    // Aktifkan zoom dengan double click
            }).setView([latitude, longitude], 17);
          
          // Menambahkan layer Google Satellite
          L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: '&copy; Google Maps'
          }).addTo(map);
          
          // Membuat custom icon dengan SVG dari AddLocationRounded-lgIcon
          const customIcon = L.divIcon({
            html: iconSVG,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 36], // Point of the icon which will correspond to marker's location
          });
          
          // Menambahkan marker dengan custom icon
          L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
        }
      };
      
      loadMap();
    }
    
    // Cleanup function
    return () => {
      if (mapRef.current && mapRef.current._leaflet_id) {
        mapRef.current._leaflet_id = null;
      }
    };
  }, []);

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kolom Kiri */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Nama perusahaan :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>Perusahaan ABCD</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Badan Usaha :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>Perseroan Terbuka</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Alamat :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>Jalan Raya CCC No 1111</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Kecamatan :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>-</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Desa :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>Banjarsari</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-sm font-semibold">Kode Pos :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>62714</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Skala :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>Besar</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">KBLI :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>23145</p>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Telepon :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>089436787543</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Email :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>abcdFactory_admin@gmail.com</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Website :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>www.abcdfactory.com</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Produk :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>Makanan dan Minuman</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Tahun Direktori:</p>
            <div className="flex gap-2">
              <div className="bg-gray-200 font-normal text-sm px-4 py-2 rounded-lg">
                <p>2023</p>
              </div>
              <div className="bg-gray-200 font-normal text-sm px-4 py-2 rounded-lg">
                <p>2024</p>
              </div>
              <div className="bg-gray-200 font-normal text-sm px-4 py-2 rounded-lg">
                <p>2025</p>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">PCL Utama :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>Ronny</p>
            </div>
          </div>
        </div>
        
        {/* Kolom Kanan */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Lokasi Perusahaan :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>Kawasan Berikat</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Nama Kawasan :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>Pergudangan Sinar Buduran III</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Latitude :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>-7.412928</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Longitude :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>112.707911</p>
              </div>
            </div>
          </div>
        
          <div className="relative">
            <div 
                ref={mapRef} 
                className="w-full p-2  rounded-lg h-48" 
            ></div>
            <button
                onClick={() => window.open(`https://www.google.com/maps?q=-7.412928,112.707911&z=17&t=k`, '_blank')}
                className="absolute top-3 right-3 bg-white p-1 rounded-md shadow-md hover:bg-gray-100 z-[1000]"
                title="Buka di Google Maps Satelit"
            >
                <FullscreenIcon style={{ fontSize: 24, color: '#555' }} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Jarak (KM) :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>13,425</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Tenaga Kerja :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>>99 Pekerja</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Investasi :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>>10 Miliar</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Omset :</p>
              <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
                <p>>50 Miliar</p>
              </div>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Narasumber :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>Anthony Salim</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Telepon Narasumber :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>085323424334</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-semibold">Email Narasumber :</p>
            <div className="bg-gray-200 font-normal text-sm p-2 rounded-lg">
              <p>anthony_abcde@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
  );
}

export default DetailDirektori;