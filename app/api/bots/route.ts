import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // from Neon
    ssl: {
        rejectUnauthorized: false,
    },
});

export async function GET() {
    try {
        const result = await pool.query("SELECT * FROM bots");
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("❌ Error querying bots:", error);
        return NextResponse.json(
            { error: "Failed to fetch bots" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const {
            asset,
            start_size,
            leverage,
            multiplier,
            take_profit,
            user_id,
            rebuy,
        } = await req.json();

        const result = await pool.query(
            `
  INSERT INTO bots (asset, start_size, leverage, multiplier, take_profit, rebuy, status, user_id, created_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
  RETURNING *;
  `,
            [
                asset,
                start_size,
                leverage,
                multiplier,
                take_profit,
                rebuy,
                "idle",
                user_id,
            ]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (err) {
        console.error("❌ DB error:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}
