<?php
declare(strict_types=1);
require_once __DIR__ . '/../_paypal.php';

r7_cors();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') r7_json(['success' => false, 'error' => 'Method not allowed'], 405);

$token = r7_env('PAYPAL_ADMIN_EXPORT_TOKEN');
if ($token === '' || ($_GET['token'] ?? '') !== $token) {
  r7_json(['success' => false, 'error' => 'Forbidden'], 403);
}

$orders = array_values(r7_load_orders());
if (($_GET['format'] ?? '') === 'csv') {
  header('Content-Type: text/csv; charset=utf-8');
  header('Content-Disposition: attachment; filename="r7-paypal-orders.csv"');
  $out = fopen('php://output', 'w');
  fputcsv($out, ['r7OrderId', 'status', 'amount', 'currency', 'packageId', 'paypalOrderId', 'paypalTransactionId', 'payerEmail', 'createdAt', 'paidAt', 'deliveryStatus']);
  foreach ($orders as $order) {
    fputcsv($out, [
      $order['r7OrderId'] ?? '',
      $order['status'] ?? '',
      $order['amount'] ?? '',
      $order['currency'] ?? '',
      $order['packageId'] ?? '',
      $order['paypalOrderId'] ?? '',
      $order['paypalTransactionId'] ?? '',
      $order['payerEmail'] ?? ($order['customerEmail'] ?? ''),
      $order['createdAt'] ?? '',
      $order['paidAt'] ?? '',
      $order['deliveryStatus'] ?? '',
    ]);
  }
  exit;
}

r7_json(['success' => true, 'orders' => $orders]);
