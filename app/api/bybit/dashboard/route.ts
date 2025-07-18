// import crypto from "crypto";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//     try {
//         const { apiKey, apiSecret } = await req.json();

//         const recvWindow = "5000";
//         const timestamp = Date.now().toString();

//         // 🔹 First request: wallet balance
//         const queryString1 = "accountType=UNIFIED";
//         const endpoint1 = "/v5/account/wallet-balance";
//         const signPayload1 = timestamp + apiKey + recvWindow + queryString1;
//         const signature1 = crypto
//             .createHmac("sha256", apiSecret)
//             .update(signPayload1)
//             .digest("hex");

//         const url1 = `https://api.bybit.com${endpoint1}?${queryString1}`;

//         const balanceRes = await fetch(url1, {
//             method: "GET",
//             headers: {
//                 "X-BAPI-API-KEY": apiKey,
//                 "X-BAPI-SIGN": signature1,
//                 "X-BAPI-SIGN-TYPE": "2",
//                 "X-BAPI-TIMESTAMP": timestamp,
//                 "X-BAPI-RECV-WINDOW": recvWindow,
//             },
//         });

//         const balanceData = await balanceRes.json();

//         // 🔹 Second request: closed PnL
//         const queryString2 = "category=linear";
//         const endpoint2 = "/v5/position/closed-pnl";
//         const signPayload2 = timestamp + apiKey + recvWindow + queryString2;
//         const signature2 = crypto
//             .createHmac("sha256", apiSecret)
//             .update(signPayload2)
//             .digest("hex");

//         const url2 = `https://api.bybit.com${endpoint2}?${queryString2}`;

//         const pnlRes = await fetch(url2, {
//             method: "GET",
//             headers: {
//                 "X-BAPI-API-KEY": apiKey,
//                 "X-BAPI-SIGN": signature2,
//                 "X-BAPI-SIGN-TYPE": "2",
//                 "X-BAPI-TIMESTAMP": timestamp,
//                 "X-BAPI-RECV-WINDOW": recvWindow,
//             },
//         });

//         const pnlData = await pnlRes.json();

//         // 🔹 Return both results
//         return NextResponse.json({
//             balance: balanceData,
//             closedPnL: pnlData,
//         });

//     } catch (err) {
//         console.error("❌ Failed to call Bybit:", err);
//         return NextResponse.json(
//             { error: "Failed to fetch data" },
//             { status: 500 }
//         );
//     }
// }
