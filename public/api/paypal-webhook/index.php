<?php
declare(strict_types=1);
require_once __DIR__ . '/../paypal/_paypal.php';

r7_cors();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') r7_json(['success' => false, 'error' => 'Method not allowed'], 405);

$raw = file_get_contents('php://input') ?: '';
$event = json_decode($raw, true);
if (!is_array($event)) r7_json(['success' => false, 'error' => 'Invalid JSON.'], 400);

$webhookId = r7_env('PAYPAL_WEBHOOK_ID');
if ($webhookId === '') r7_json(['success' => false, 'error' => 'PAYPAL_WEBHOOK_ID is not configured.'], 500);

$verification = [
  'auth_algo' => $_SERVER['HTTP_PAYPAL_AUTH_ALGO'] ?? '',
  'cert_url' => $_SERVER['HTTP_PAYPAL_CERT_URL'] ?? '',
  'transmission_id' => $_SERVER['HTTP_PAYPAL_TRANSMISSION_ID'] ?? '',
  'transmission_sig' => $_SERVER['HTTP_PAYPAL_TRANSMISSION_SIG'] ?? '',
  'transmission_time' => $_SERVER['HTTP_PAYPAL_TRANSMISSION_TIME'] ?? '',
  'webhook_id' => $webhookId,
  'webhook_event' => $event,
];

$verified = r7_paypal_request('POST', '/v1/notifications/verify-webhook-signature', $verification);
if (!$verified['ok'] || (($verified['data']['verification_status'] ?? '') !== 'SUCCESS')) {
  r7_json(['success' => false, 'error' => 'Webhook signature verification failed.'], 400);
}

$eventType = $event['event_type'] ?? '';
$resource = $event['resource'] ?? [];
$r7OrderId = $resource['purchase_units'][0]['custom_id']
  ?? $resource['purchase_units'][0]['invoice_id']
  ?? $resource['custom_id']
  ?? $resource['invoice_id']
  ?? '';

if ($r7OrderId === '' && isset($resource['supplementary_data']['related_ids']['order_id'])) {
  $found = r7_find_order_by_paypal_id((string)$resource['supplementary_data']['related_ids']['order_id']);
  $r7OrderId = $found['r7OrderId'] ?? '';
}

if ($r7OrderId !== '') {
  if (in_array($eventType, ['PAYMENT.CAPTURE.COMPLETED', 'CHECKOUT.ORDER.APPROVED'], true)) {
    $patch = [
      'status' => $eventType === 'PAYMENT.CAPTURE.COMPLETED' ? 'paid' : 'approved',
      'paypalWebhookEvent' => $eventType,
      'paypalWebhookAt' => gmdate('c'),
    ];
    if (isset($resource['id'])) $patch['paypalTransactionId'] = $resource['id'];
    if (isset($resource['amount']['value'])) $patch['amount'] = $resource['amount']['value'];
    $updated = r7_mark_order($r7OrderId, $patch);
    if (($updated['status'] ?? '') === 'paid' && empty($updated['deliveryStatus'])) {
      r7_mark_order($r7OrderId, ['deliveryStatus' => r7_send_report_email($updated)]);
    }
  } elseif (in_array($eventType, ['PAYMENT.CAPTURE.DENIED', 'CHECKOUT.ORDER.VOIDED'], true)) {
    r7_mark_order($r7OrderId, ['status' => 'failed', 'paypalWebhookEvent' => $eventType]);
  } elseif ($eventType === 'PAYMENT.CAPTURE.REFUNDED') {
    r7_mark_order($r7OrderId, ['status' => 'refunded', 'paypalWebhookEvent' => $eventType]);
  } else {
    r7_mark_order($r7OrderId, ['lastWebhookEvent' => $eventType, 'lastWebhookAt' => gmdate('c')]);
  }
}

r7_json(['success' => true, 'eventType' => $eventType, 'r7OrderId' => $r7OrderId]);
