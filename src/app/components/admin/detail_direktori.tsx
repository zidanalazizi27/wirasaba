"use client";

import React, { useEffect, useRef, useState } from "react";
import AddLocationRoundedIcon from "@mui/icons-material/AddLocationRounded";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { renderToString } from "react-dom/server";
import { useRouter } from "next/navigation";

interface DetailDirektoriProps {
  id_perusahaan: string | string[];
  mode?: "view" | "edit"; // Tambahkan prop mode
  onSave?: (data: PerusahaanData) => Promise<void>; // Handler untuk tombol simpan
  onCancel?: () => void; // Handler untuk tombol batalkan
}

interface PerusahaanData {
  id_perusahaan: number;
  kip: string | number;
  nama_perusahaan: string;
  badan_usaha: number;
  badan_usaha_nama: string;
  alamat: string;
  kec: number;
  kec_nama: string;
  des: number;
  des_nama: string;
  kode_pos: string;
  skala: string;
  lok_perusahaan: number;
  lok_perusahaan_nama: string;
  nama_kawasan: string | null;
  lat: number | null;
  lon: number | null;
  jarak: number | null;
  produk: string;
  KBLI: number;
  telp_perusahaan: string | null;
  email_perusahaan: string | null;
  web_perusahaan: string | null;
  tkerja: number;
  tkerja_nama: string;
  investasi: number;
  investasi_nama: string;
  omset: number;
  omset_nama: string;
  nama_narasumber: string;
  jbtn_narasumber: string;
  email_narasumber: string | null;
  telp_narasumber: string | null;
  catatan: string | null;
  tahun_direktori: number[];
  pcl_utama: string;
}

const DetailDirektori: React.FC<DetailDirektoriProps> = ({
  id_perusahaan,
  mode = "view", // Berikan nilai default 'view'
  onSave,
  onCancel,
}) => {
  const mapRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PerusahaanData | null>(null);
  const [editedData, setEditedData] = useState<PerusahaanData | null>(null);

  // State untuk opsi dropdown
  const [badanUsahaOptions, setBadanUsahaOptions] = useState<any[]>([]);
  const [kecamatanOptions, setKecamatanOptions] = useState<any[]>([]);
  const [desaOptions, setDesaOptions] = useState<any[]>([]);
  const [lokasiOptions, setLokasiOptions] = useState<any[]>([]);
  const [tenagaKerjaOptions, setTenagaKerjaOptions] = useState<any[]>([]);
  const [investasiOptions, setInvestasiOptions] = useState<any[]>([]);
  const [omsetOptions, setOmsetOptions] = useState<any[]>([]);
  const [pclOptions, setPclOptions] = useState<any[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const fetchDropdownOptions = async () => {
    try {
      // Fetch badan usaha options
      const buResponse = await fetch("/api/badan-usaha");
      if (buResponse.ok) {
        const buData = await buResponse.json();
        setBadanUsahaOptions(buData.data || []);
      }

      // Fetch kecamatan data
      const kecResponse = await fetch("/api/kecamatan");
      if (kecResponse.ok) {
        const kecData = await kecResponse.json();
        setKecamatanOptions(kecData.data || []);
      }

      // Fetch desa
      if (editedData?.kec) {
        const desaResponse = await fetch(`/api/desa?kec_id=${editedData.kec}`);
        if (desaResponse.ok) {
          const desaData = await desaResponse.json();
          setDesaOptions(desaData.data || []);
        }
      }

      // Fetch lokasi perusahaan
      const lokasiResponse = await fetch("/api/lokasi-perusahaan");
      if (lokasiResponse.ok) {
        const lokasiData = await lokasiResponse.json();
        setLokasiOptions(lokasiData.data || []);
      }

      // Fetch tenaga kerja
      const tkerjaResponse = await fetch("/api/tenaga-kerja");
      if (tkerjaResponse.ok) {
        const tkerjaData = await tkerjaResponse.json();
        setTenagaKerjaOptions(tkerjaData.data || []);
      }

      // Fetch investasi
      const investasiResponse = await fetch("/api/investasi");
      if (investasiResponse.ok) {
        const investasiData = await investasiResponse.json();
        setInvestasiOptions(investasiData.data || []);
      }

      // Fetch omset
      const omsetResponse = await fetch("/api/omset");
      if (omsetResponse.ok) {
        const omsetData = await omsetResponse.json();
        setOmsetOptions(omsetData.data || []);
      }

      // Fetch PCL options
      const pclResponse = await fetch("/api/pcl");
      if (pclResponse.ok) {
        const pclData = await pclResponse.json();
        setPclOptions(pclData.data || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Panggil fungsi fetch dropdown saat komponen dimuat dalam mode edit
  useEffect(() => {
    if (mode === "edit") {
      fetchDropdownOptions();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === "edit" && editedData?.kec) {
      const fetchDesa = async () => {
        try {
          const response = await fetch(`/api/desa?kec_id=${editedData.kec}`); // Fetch desa saat kecamatan berubah
          if (response.ok) {
            const result = await response.json();
            setDesaOptions(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching desa:", error);
        }
      };

      fetchDesa();
    }
  }, [editedData?.kec, mode]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch data perusahaan dari API berdasarkan id_perusahaan
        const response = await fetch(`/api/perusahaan/${id_perusahaan}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data perusahaan");
        setLoading(false);
      }
    };

    if (id_perusahaan) {
      fetchData();
    }
  }, [id_perusahaan]);

  // Inisialisasi data edit saat data asli berubah
  useEffect(() => {
    if (data) {
      setEditedData({ ...data });
    }
  }, [data]);

  // Handler untuk perubahan input
  const handleInputChange = (field: keyof PerusahaanData, value: any) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
  };

  //fungsi validasi sebelum menyimpan perubahan
  const validateData = (): boolean => {
    // Reset pesan error
    const errors: Record<string, string> = {};

    // Validasi nama perusahaan
    if (!editedData?.nama_perusahaan?.trim()) {
      errors.nama_perusahaan = "Nama perusahaan tidak boleh kosong";
    }

    // Validasi alamat
    if (!editedData?.alamat?.trim()) {
      errors.alamat = "Alamat tidak boleh kosong";
    }

    // Tampilkan error jika ada
    if (Object.keys(errors).length > 0) {
      const errorMessage = Object.values(errors).join("\n");
      alert(errorMessage);
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (editedData && validateData()) {
      onSave && onSave(editedData);
    }
  };

  const handleCancel = () => {
    // Jika ada perubahan, konfirmasi dulu
    if (JSON.stringify(data) !== JSON.stringify(editedData)) {
      if (
        confirm(
          "Perubahan yang Anda buat belum disimpan. Yakin ingin membatalkan?"
        )
      ) {
        onCancel && onCancel();
      }
    } else {
      // Jika tidak ada perubahan, langsung batalkan
      onCancel && onCancel();
    }
  };

  useEffect(() => {
    // Memastikan Leaflet hanya dijalankan di client-side dan hanya jika data sudah ada
    if (typeof window !== "undefined" && data && data.lat && data.lon) {
      // Async import Leaflet untuk client-side rendering
      const loadMap = async () => {
        const L = (await import("leaflet")).default;
        // Pastikan CSS Leaflet dimuat
        await import("leaflet/dist/leaflet.css");

        // Koordinat dari data
        const latitude = data.lat;
        const longitude = data.lon;

        // Render Material-UI icon ke string SVG
        const iconSVG = renderToString(
          <AddLocationRoundedIcon
            style={{
              color: "#E52020",
              fontSize: 30,
              filter: "drop-shadow(0px 3px 3px rgba(0, 0, 0, 1))",
            }}
          />
        );

        if (mapRef.current && !mapRef.current._leaflet_id) {
          const map = L.map(mapRef.current, {
            dragging: true,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
          }).setView([latitude, longitude], 17);

          // Menambahkan layer Google Satellite
          L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"],
            attribution: "&copy; Google Maps",
          }).addTo(map);

          // Membuat custom icon dengan SVG
          const customIcon = L.divIcon({
            html: iconSVG,
            className: "",
            iconSize: [36, 36],
            iconAnchor: [18, 36],
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
  }, [data]);

  if (loading) {
    return <div className="p-4 text-center">Memuat data...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error || "Data tidak ditemukan"}</p>
        <button
          onClick={() => router.push("/admin/direktori")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kolom Kiri */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Nama perusahaan :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.nama_perusahaan}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.nama_perusahaan || ""}
                onChange={(e) =>
                  handleInputChange("nama_perusahaan", e.target.value)
                }
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Badan Usaha :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.badan_usaha_nama}</p>
              </div>
            ) : (
              <select
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.badan_usaha || ""}
                onChange={(e) =>
                  handleInputChange("badan_usaha", parseInt(e.target.value))
                }
              >
                {badanUsahaOptions.length > 0 ? (
                  badanUsahaOptions.map((option) => (
                    <option key={option.id_bu} value={option.id_bu}>
                      {option.ket_bu}
                    </option>
                  ))
                ) : (
                  // Opsi default jika data belum dimuat
                  <option value="">Loading...</option>
                )}
              </select>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Alamat :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.alamat || "-"}</p>
              </div>
            ) : (
              <input
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.alamat || ""}
                onChange={(e) => handleInputChange("alamat", e.target.value)}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Kecamatan :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.kec_nama || "-"}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.kec || ""}
                  onChange={(e) =>
                    handleInputChange("kec", parseInt(e.target.value))
                  }
                >
                  <option value="">Pilih Kecamatan</option>
                  {kecamatanOptions.map((option) => (
                    <option key={option.kode_kec} value={option.kode_kec}>
                      {option.nama_kec}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Desa :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.des_nama || "-"}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.des || ""}
                  onChange={(e) =>
                    handleInputChange("des", parseInt(e.target.value))
                  }
                  disabled={!editedData?.kec}
                >
                  <option value="">Pilih Desa</option>
                  {desaOptions.map((option) => (
                    <option key={option.kode_des} value={option.kode_des}>
                      {option.nama_des}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-sm font-semibold">Kode Pos :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.kode_pos}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.kode_pos || ""}
                  onChange={(e) =>
                    handleInputChange("kode_pos", e.target.value)
                  }
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Skala :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.skala}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.skala || ""}
                  onChange={(e) => handleInputChange("skala", e.target.value)}
                >
                  <option value="">Pilih Skala</option>
                  <option value="Besar">Besar</option>
                  <option value="Sedang">Sedang</option>
                </select>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">KBLI :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.KBLI}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.KBLI || ""}
                  onChange={(e) => handleInputChange("KBLI", e.target.value)}
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Telepon :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.telp_perusahaan || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.telp_perusahaan || ""}
                onChange={(e) =>
                  handleInputChange("telp_perusahaan", e.target.value)
                }
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Email :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.email_perusahaan || "-"}</p>
              </div>
            ) : (
              <input
                type="email"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.email_perusahaan || ""}
                onChange={(e) =>
                  handleInputChange("email_perusahaan", e.target.value)
                }
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Website :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.web_perusahaan || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.web_perusahaan || ""}
                onChange={(e) =>
                  handleInputChange("web_perusahaan", e.target.value)
                }
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Produk :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.produk || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.produk || ""}
                onChange={(e) => handleInputChange("produk", e.target.value)}
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Tahun Direktori:</p>
            <div className="flex gap-2">
              {data.tahun_direktori.map((tahun) => (
                <div
                  key={tahun}
                  className="bg-gray-200 font-medium text-sm px-4 py-2 rounded-lg"
                >
                  <p>{tahun}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">PCL Utama :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.pcl_utama || "-"}</p>
              </div>
            ) : (
              <select
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.pcl_utama || ""}
                onChange={(e) => handleInputChange("pcl_utama", e.target.value)}
              >
                <option value="">-- Pilih PCL --</option>
                {pclOptions.map((option) => (
                  <option key={option.id_pcl} value={option.nama_pcl}>
                    {option.nama_pcl} ({option.status_pcl})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Lokasi Perusahaan :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.lok_perusahaan_nama}</p>
              </div>
            ) : (
              <select
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.lok_perusahaan || ""}
                onChange={(e) =>
                  handleInputChange("lok_perusahaan", parseInt(e.target.value))
                }
              >
                <option value="">Pilih Lokasi</option>
                {lokasiOptions.map((option) => (
                  <option key={option.id_lok} value={option.id_lok}>
                    {option.ket_lok}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Nama Kawasan :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.nama_kawasan || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.nama_kawasan || ""}
                onChange={(e) =>
                  handleInputChange("nama_kawasan", e.target.value)
                }
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Latitude :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.lat || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.lat || ""}
                  onChange={(e) => handleInputChange("lat", e.target.value)}
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Longitude :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.lon || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.lon || ""}
                  onChange={(e) => handleInputChange("lon", e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="relative">
            {data.lat && data.lon ? (
              <>
                <div ref={mapRef} className="w-full p-2 rounded-lg h-48"></div>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${data.lat},${data.lon}&z=17&t=k`,
                      "_blank"
                    )
                  }
                  className="absolute top-3 right-3 bg-white p-1 rounded-md shadow-md hover:bg-gray-100 z-[1000]"
                  title="Buka di Google Maps Satelit"
                >
                  <FullscreenIcon style={{ fontSize: 24, color: "#555" }} />
                </button>
              </>
            ) : (
              <div className="w-full p-4 rounded-lg h-48 bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Koordinat tidak tersedia</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Jarak (KM) :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.jarak || "-"}</p>
                </div>
              ) : (
                <input
                  type="text"
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.jarak || ""}
                  onChange={(e) => handleInputChange("jarak", e.target.value)}
                />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Tenaga Kerja :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.tkerja_nama}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.tkerja || ""}
                  onChange={(e) =>
                    handleInputChange("tkerja", parseInt(e.target.value))
                  }
                >
                  <option value="">Pilih Tenaga Kerja</option>
                  {tenagaKerjaOptions.map((option) => (
                    <option key={option.id_tkerja} value={option.id_tkerja}>
                      {option.ket_tkerja}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-semibold">Investasi :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.investasi_nama}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.investasi || ""}
                  onChange={(e) =>
                    handleInputChange("investasi", parseInt(e.target.value))
                  }
                >
                  <option value="">Pilih Investasi</option>
                  {investasiOptions.map((option) => (
                    <option
                      key={option.id_investasi}
                      value={option.id_investasi}
                    >
                      {option.ket_investasi}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold">Omset :</p>
              {mode === "view" ? (
                <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                  <p>{data.omset_nama}</p>
                </div>
              ) : (
                <select
                  className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                  value={editedData?.omset || ""}
                  onChange={(e) =>
                    handleInputChange("omset", parseInt(e.target.value))
                  }
                >
                  <option value="">Pilih Omset</option>
                  {omsetOptions.map((option) => (
                    <option key={option.id_omset} value={option.id_omset}>
                      {option.ket_omset}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold">Narasumber :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.nama_narasumber || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.nama_narasumber || ""}
                onChange={(e) =>
                  handleInputChange("nama_narasumber", e.target.value)
                }
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Telepon Narasumber :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.telp_narasumber || "-"}</p>
              </div>
            ) : (
              <input
                type="text"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.telp_narasumber || ""}
                onChange={(e) =>
                  handleInputChange("telp_narasumber", e.target.value)
                }
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold">Email Narasumber :</p>
            {mode === "view" ? (
              <div className="bg-gray-200 font-medium text-sm p-2 rounded-lg">
                <p>{data.email_narasumber || "-"}</p>
              </div>
            ) : (
              <input
                type="email"
                className="border border-gray-300 font-medium text-sm p-2 rounded-lg w-full"
                value={editedData?.email_narasumber || ""}
                onChange={(e) =>
                  handleInputChange("email_narasumber", e.target.value)
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Tambahkan kode tombol aksi di sini, setelah grid */}
      {mode === "edit" && editedData && (
        <div className="mt-4 flex justify-end space-x-3 text-sm">
          <button
            onClick={handleCancel}
            className="px-2 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Batalkan
          </button>
          <button
            onClick={() => onSave && onSave(editedData)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Simpan
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailDirektori;
