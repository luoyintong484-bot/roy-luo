<?php
declare(strict_types=1);
require_once __DIR__ . '/../_paypal.php';

r7_cors();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') r7_json(['success' => false, 'error' => 'Method not allowed'], 405);

$body = r7_read_json_body();
$packages = r7_allowed_packages();
$packageId = is_string($body['packageId'] ?? null) ? $body['packageId'] : 'quick_18';
if (!isset($packages[$packageId])) r7_json(['success' => false, 'error' => 'Invalid package.'], 400);

$package = $packages[$packageId];
$r7OrderId = r7_order_id();
$returnPath = r7_sanitize_return_path($body['returnPath'] ?? '/');
$reportKey = is_string($body['reportKey'] ?? null) ? substr($body['reportKey'], 0, 120) : '';
$reportType = is_string($body['reportType'] ?? null) ? substr($body['reportType'], 0, 60) : 'digital_report';
$customerEmail = is_string($body['customerEmail'] ?? null) ? trim($body['customerEmail']) : '';

$successUrl = r7_site_url() . '/pay-success?' . http_build_query([
  'provider' => 'paypal',
  'r7_order' => $r7OrderId,
  'return' => $returnPath,
  'report' => $reportKey,
  'type' => $reportType,
]);
$cancelUrl = r7_site_url() . '/pay-cancel?' . http_build_query([
  'provider' => 'paypal',
  'r7_order' => $r7OrderId,
  'return' => $returnPath,
  'report' => $reportKey,
  'type' => $reportType,
]);

$payload = [
  'intent' => 'CAPTURE',
  'purchase_units' => [[
    'reference_id' => $r7OrderId,
    'custom_id' => $r7OrderId,
    'invoice_id' => $r7OrderId,
    'description' => R7_PAYPAL_PRODUCT_NAME,
    'amount' => [
      'currency_code' => 'USD',
      'value' => $package['amount'],
    ],
  ]],
  'application_context' => [
    'brand_name' => 'R7 Fortune',
    'locale' => 'en-US',
    'landing_page' => 'BILLING',
    'shipping_preference' => 'NO_SHIPPING',
    'user_action' => 'PAY_NOW',
    'return_url' => $successUrl,
    'cancel_url' => $cancelUrl,
  ],
];

$created = r7_paypal_request('POST', '/v2/checkout/orders', $payload, $r7OrderId);
if (!$created['ok']) {
  r7_mark_order($r7OrderId, [
    'status' => 'create_failed',
    'packageId' => $packageId,
    'amount' => $package['amount'],
    'paypalError' => $created['data'],
    'createdAt' => gmdate('c'),
  ]);
  r7_json(['success' => false, 'error' => 'PayPal order creation failed.', 'detail' => $created['data']], 502);
}

$paypalOrder = $created['data'];
$approveUrl = '';
foreach (($paypalOrder['links'] ?? []) as $link) {
  if (($link['rel'] ?? '') === 'approve') {
    $approveUrl = $link['href'] ?? '';
    break;
  }
}
if ($approveUrl === '') r7_json(['success' => false, 'error' => 'PayPal approval link missing.'], 502);

r7_mark_order($r7OrderId, [
  'status' => 'created',
  'packageId' => $packageId,
  'packageLabel' => $package['label'],
  'amount' => $package['amount'],
  'currency' => 'USD',
  'productName' => R7_PAYPAL_PRODUCT_NAME,
  'paypalOrderId' => $paypalOrder['id'] ?? '',
  'customerEmail' => $customerEmail,
  'reportKey' => $reportKey,
  'reportType' => $reportType,
  'returnPath' => $returnPath,
  'createdAt' => gmdate('c'),
]);

r7_json([
  'success' => true,
  'r7OrderId' => $r7OrderId,
  'paypalOrderId' => $paypalOrder['id'] ?? '',
  'approveUrl' => $approveUrl,
  'amount' => $package['amount'],
  'currency' => 'USD',
]);
