import { NextResponse } from "next/server";
import { getAuthenticatedAdmin, hasPermission } from "@/lib/admin/auth";

const MEDIA_ASSETS = [
  {
    id: "media-sem-01",
    entity_name: "Kota Lama Semarang",
    region_name: "Kota Semarang (33.74)",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Gereja_Blenduk%2C_Semarang%2C_2014-07-07_01.jpg/1280px-Gereja_Blenduk%2C_Semarang%2C_2014-07-07_01.jpg",
    caption: "Gereja Blenduk, ikon cagar budaya abad ke-18 di kawasan Kota Lama Semarang.",
    license_type: "CC BY-SA 4.0",
    attribution: "Foto oleh Chris Woodrich via Wikimedia Commons",
    verification_status: "VERIFIED",
    linked_subjects: ["IPS", "Bahasa Indonesia"],
  },
  {
    id: "media-sem-02",
    entity_name: "Pelabuhan Tanjung Emas",
    region_name: "Kota Semarang (33.74)",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Tanjung_Emas_Port_Semarang.jpg/1280px-Tanjung_Emas_Port_Semarang.jpg",
    caption: "Aktivitas dermaga bongkar muat peti kemas dan logistik maritim Pelabuhan Tanjung Emas.",
    license_type: "CC BY-SA 3.0",
    attribution: "Foto oleh Tropenmuseum via Wikimedia Commons",
    verification_status: "VERIFIED",
    linked_subjects: ["IPS", "Matematika"],
  },
  {
    id: "media-pnr-01",
    entity_name: "Kesenian Reog Ponorogo",
    region_name: "Kabupaten Ponorogo (35.02)",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Reog_Ponorogo_Performance.jpg/1280px-Reog_Ponorogo_Performance.jpg",
    caption: "Pentas Dadak Merak Reog Ponorogo pada perayaan Grebeg Suro.",
    license_type: "CC BY-SA 4.0",
    attribution: "Wikimedia Commons Contributor",
    verification_status: "VERIFIED",
    linked_subjects: ["IPS", "Bahasa Indonesia"],
  },
  {
    id: "media-pnr-02",
    entity_name: "Peternakan Sapi Perah Pudak",
    region_name: "Kabupaten Ponorogo (35.02)",
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Dairy_cattle_milking.jpg/1280px-Dairy_cattle_milking.jpg",
    caption: "Sentra peternakan sapi perah dataran tinggi lereng Gunung Wilis, Kecamatan Pudak.",
    license_type: "CC BY-SA 4.0",
    attribution: "Foto Dokumentasi Agrikultur Wikimedia Commons",
    verification_status: "VERIFIED",
    linked_subjects: ["Matematika", "IPS"],
  },
];

export async function GET() {
  try {
    const authData = await getAuthenticatedAdmin();
    if (!authData || !hasPermission(authData.admin, "media.manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      media_assets: MEDIA_ASSETS,
      total: MEDIA_ASSETS.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
