export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        has_database_url: !!process.env.DATABASE_URL,
        has_direct_url: !!process.env.DIRECT_URL,
        has_meta_app_id: !!process.env.NEXT_PUBLIC_META_APP_ID,
        has_meta_secret: !!process.env.META_APP_SECRET,
        has_meta_link: !!process.env.WA_META_LINK_ENABLED,
        meta_link_value: process.env.WA_META_LINK_ENABLED,
        node_env: process.env.NODE_ENV,
        // Show first 20 chars of DATABASE_URL to help debug (safe - just shows protocol+user)
        db_url_prefix: process.env.DATABASE_URL?.substring(0, 30) || "NOT SET",
    });
}
