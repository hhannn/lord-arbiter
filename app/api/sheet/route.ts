// app/api/sheet/route.ts
export const runtime = "nodejs";

function csvToJson(csv: string) {
    const [headerLine, ...lines] = csv.trim().split("\n");
    const headers = headerLine.split(",").map((h) => h.trim());

    return lines.map((line) => {
        const values = line.split(",").map((v) => v.trim());
        return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    });
}

export async function GET() {
    const sheetId = "1hC0bDkFrB8m4DvFwqL4wayfvx-cjdz8gADqDwaY2Tl8";
    const gid = "546139081";
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

    try {
        const res = await fetch(sheetUrl);
        if (!res.ok) {
            return new Response(`Upstream error: ${res.statusText}`, {
                status: res.status,
            });
        }

        const csvText = await res.text();
        const jsonData = csvToJson(csvText).map((row) => ({
            ...row,
            averageBased: Boolean(row.averageBased.toLowerCase() === "true"),
            // startSize: Number(row.startSize),
            drawdownRatio: Number(row.drawdownRatio.replace("%", "")),
            roi: Number(row.roi.replace("%", "")),
        }));

        return new Response(JSON.stringify(jsonData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err: Error | any) {
        return new Response(err.message || "Internal server error", {
            status: 500,
        });
    }
}
