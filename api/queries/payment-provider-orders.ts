import mysql, { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { env } from "../lib/env";

export type PaymentProviderOrderRecord = {
  id: number;
  outTradeNo: string;
  provider: "alipay";
  userId: number | null;
  readingId: number | null;
  reportType: string;
  reportKey: string;
  subject: string;
  amount: string;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  providerTradeNo: string | null;
  accessTokenHash: string;
  returnPath: string;
};

type OrderRow = RowDataPacket & {
  id: number;
  out_trade_no: string;
  provider: "alipay";
  user_id: number | null;
  reading_id: number | null;
  report_type: string;
  report_key: string;
  subject: string;
  amount: string;
  currency: string;
  status: PaymentProviderOrderRecord["status"];
  provider_trade_no: string | null;
  access_token_hash: string;
  return_path: string;
};

// ---------------------------------------------------------------------------
// Local-dev in-memory fallback.
// When DATABASE_URL is empty (typical local dev), we cannot reach MySQL. To let
// the Alipay cashier flow be exercised locally without a database, orders are
// kept in a process-local Map. In production (DATABASE_URL set) behaviour is
// unchanged and the real MySQL pool is used.
// ---------------------------------------------------------------------------
const USE_MEMORY = !env.databaseUrl;

type MemOrder = PaymentProviderOrderRecord;
const memOrders = new Map<string, MemOrder>();
let memId = 1;

const pool = USE_MEMORY
  ? null
  : mysql.createPool({
      uri: env.databaseUrl,
      connectionLimit: 5,
      connectTimeout: 5_000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

function mapOrder(row: OrderRow): PaymentProviderOrderRecord {
  return {
    id: Number(row.id),
    outTradeNo: row.out_trade_no,
    provider: row.provider,
    userId: row.user_id === null ? null : Number(row.user_id),
    readingId: row.reading_id === null ? null : Number(row.reading_id),
    reportType: row.report_type,
    reportKey: row.report_key,
    subject: row.subject,
    amount: String(row.amount),
    currency: row.currency,
    status: row.status,
    providerTradeNo: row.provider_trade_no,
    accessTokenHash: row.access_token_hash,
    returnPath: row.return_path,
  };
}

export async function createPaymentProviderOrder(input: {
  outTradeNo: string;
  userId?: number;
  readingId?: number;
  reportType: string;
  reportKey: string;
  subject: string;
  amount: string;
  accessTokenHash: string;
  returnPath: string;
}) {
  if (USE_MEMORY) {
    const record: MemOrder = {
      id: memId++,
      outTradeNo: input.outTradeNo,
      provider: "alipay",
      userId: input.userId ?? null,
      readingId: input.readingId ?? null,
      reportType: input.reportType,
      reportKey: input.reportKey,
      subject: input.subject,
      amount: input.amount,
      currency: "CNY",
      status: "pending",
      providerTradeNo: null,
      accessTokenHash: input.accessTokenHash,
      returnPath: input.returnPath,
    };
    memOrders.set(input.outTradeNo, record);
    return;
  }

  await pool!.execute<ResultSetHeader>(
    `INSERT INTO payment_provider_orders
      (out_trade_no, user_id, reading_id, report_type, report_key, subject, amount, access_token_hash, return_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.outTradeNo,
      input.userId ?? null,
      input.readingId ?? null,
      input.reportType,
      input.reportKey,
      input.subject,
      input.amount,
      input.accessTokenHash,
      input.returnPath,
    ],
  );
}

export async function findPaymentProviderOrder(outTradeNo: string) {
  if (USE_MEMORY) {
    return memOrders.get(outTradeNo);
  }

  const [rows] = await pool!.execute<OrderRow[]>(
    `SELECT id, out_trade_no, provider, user_id, reading_id, report_type, report_key,
            subject, amount, currency, status, provider_trade_no, access_token_hash, return_path
       FROM payment_provider_orders
      WHERE out_trade_no = ? AND provider = 'alipay'
      LIMIT 1`,
    [outTradeNo],
  );
  return rows[0] ? mapOrder(rows[0]) : undefined;
}

export async function completePaymentProviderOrder(id: number, providerTradeNo: string | null) {
  if (USE_MEMORY) {
    for (const order of memOrders.values()) {
      if (order.id === id) {
        order.status = "completed";
        order.providerTradeNo = providerTradeNo;
      }
    }
    return;
  }

  await pool!.execute<ResultSetHeader>(
    `UPDATE payment_provider_orders
        SET status = 'completed', provider_trade_no = ?, paid_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
    [providerTradeNo, id],
  );
}

export async function closePaymentProviderOrder(
  id: number,
  status: "failed" | "refunded",
  providerTradeNo: string | null,
) {
  if (USE_MEMORY) {
    for (const order of memOrders.values()) {
      if (order.id === id) {
        order.status = status;
        order.providerTradeNo = providerTradeNo;
      }
    }
    return;
  }

  await pool!.execute<ResultSetHeader>(
    `UPDATE payment_provider_orders
        SET status = ?, provider_trade_no = ?
      WHERE id = ?`,
    [status, providerTradeNo, id],
  );
}

export async function markReadingPaid(readingId: number) {
  if (USE_MEMORY) {
    // Local dev has no `readings` table; the paid flag is not persisted here.
    // The unlock flow is fully exercised only against a real database.
    console.warn(`[alipay][memory] markReadingPaid(${readingId}) skipped (no database)`);
    return;
  }

  await pool!.execute<ResultSetHeader>(
    `UPDATE readings SET is_paid = 1, paid_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [readingId],
  );
}
