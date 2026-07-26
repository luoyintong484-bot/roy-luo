<?php
declare(strict_types=1);
require_once __DIR__ . '/../_paypal.php';

r7_cors();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') r7_json(['success' => false, 'error' => 'Method not allowed'], 405);

$body = r7_read_json_body();
$paypalOrderId = is_string($body['paypalOrderId'] ?? null) ? trim($body['paypalOrderId']) : '';
$r7OrderId = is_string($body['r7OrderId'] ?? null) ? trim($body['r7OrderId']) : '';
if ($paypalOrderId === '') r7_json(['success' => false, 'error' => 'Missing PayPal order ID.'], 400);

$order = $r7OrderId !== '' ? (r7_load_orders()[$r7OrderId] ?? null) : r7_find_order_by_paypal_id($paypalOrderId);
if (!$order) r7_json(['success' => false, 'error' => 'R7 order not found.'], 404);
$r7OrderId = $order['r7OrderId'];

if (($order['status'] ?? '') === 'paid') {
  r7_json(['success' => true, 'status' => 'paid', 'order' => $order]);
}

$captured = r7_paypal_request('POST', '/v2/checkout/orders/' . rawurlencode($paypalOrderId) . '/capture', null, $r7OrderId . '-capture');
if (!$captured['ok']) {
  r7_mark_order($r7OrderId, [
    'status' => 'capture_failed',
    'paypalCaptureError' => $captured['data'],
  ]);
  r7_json(['success' => false, 'error' => 'PayPal capture failed.', 'detail' => $captured['data']], 502);
}

$data = $captured['data'];
$capture = $data['purchase_units'][0]['payments']['captures'][0] ?? [];
$payer = $data['payer'] ?? [];
$payerEmail = $payer['email_address'] ?? '';
$transactionId = $capture['id'] ?? '';
$amount = $capture['amount']['value'] ?? ($order['amount'] ?? '');

$updated = r7_mark_order($r7OrderId, [
  'status' => 'paid',
  'paypalOrderId' => $paypalOrderId,
  'paypalTransactionId' => $transactionId,
  'payerEmail' => $payerEmail,
  'amount' => $amount,
  'currency' => $capture['amount']['currency_code'] ?? 'USD',
  'paidAt' => gmdate('c'),
  'paypalCapture' => $data,
]);
$deliveryStatus = r7_send_report_email($updated);
$updated = r7_mark_order($r7OrderId, ['deliveryStatus' => $deliveryStatus]);

r7_json([
  'success' => true,
  'status' => 'paid',
  'r7OrderId' => $r7OrderId,
  'paypalTransactionId' => $transactionId,
  'payerEmail' => $payerEmail,
  'deliveryStatus' => $deliveryStatus,
  'order' => $updated,
]);
