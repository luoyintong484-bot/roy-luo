<?php
declare(strict_types=1);

const R7_PAYPAL_PRODUCT_NAME = 'Digital Psychological Analysis Report';

function r7_json(array $payload, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function r7_env(string $key, string $default = ''): string {
  $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);
  return is_string($value) && $value !== '' ? $value : $default;
}

function r7_paypal_base(): string {
  return strtolower(r7_env('PAYPAL_ENV', 'sandbox')) === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function r7_allowed_packages(): array {
  return [
    'quick_18' => [
      'amount' => '18.00',
      'label' => 'Quick Digital Report',
      'labelZh' => '快速數字解讀報告',
    ],
    'deep_38' => [
      'amount' => '38.00',
      'label' => 'Deep Digital Report',
      'labelZh' => '深度數字解讀報告',
    ],
    'premium_88' => [
      'amount' => '88.00',
      'label' => 'Premium Digital Report',
      'labelZh' => '高階完整數字解讀報告',
    ],
  ];
}

function r7_read_json_body(): array {
  $raw = file_get_contents('php://input') ?: '';
  $json = json_decode($raw, true);
  return is_array($json) ? $json : [];
}

function r7_sanitize_return_path(?string $path): string {
  if (!$path || $path[0] !== '/' || str_starts_with($path, '//')) return '/';
  return preg_replace('/[^A-Za-z0-9_\-\/\?\=\&\#\.\%]/', '', $path) ?: '/';
}

function r7_site_url(): string {
  $configured = r7_env('R7_SITE_URL', 'https://r7fortune.com');
  return rtrim($configured, '/');
}

function r7_storage_file(): string {
  $root = dirname(__DIR__, 3);
  $dir = $root . '/storage';
  if (!is_dir($dir)) mkdir($dir, 0755, true);
  return $dir . '/paypal-orders.php';
}

function r7_load_orders(): array {
  $file = r7_storage_file();
  if (!file_exists($file)) return [];
  $content = file_get_contents($file) ?: '';
  $content = preg_replace('/^<\?php exit; \?>\s*/', '', $content);
  $orders = json_decode($content ?: '{}', true);
  return is_array($orders) ? $orders : [];
}

function r7_save_orders(array $orders): void {
  $file = r7_storage_file();
  file_put_contents($file, "<?php exit; ?>\n" . json_encode($orders, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
}

function r7_order_id(): string {
  return 'R7P' . strtoupper(substr(bin2hex(random_bytes(6)), 0, 12));
}

function r7_paypal_token(): string {
  $clientId = r7_env('PAYPAL_CLIENT_ID');
  $secret = r7_env('PAYPAL_CLIENT_SECRET');
  if ($clientId === '' || $secret === '') {
    r7_json(['success' => false, 'error' => 'PayPal credentials are not configured on server.'], 500);
  }

  $ch = curl_init(r7_paypal_base() . '/v1/oauth2/token');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_USERPWD => $clientId . ':' . $secret,
    CURLOPT_POSTFIELDS => 'grant_type=client_credentials',
    CURLOPT_HTTPHEADER => ['Accept: application/json', 'Accept-Language: en_US'],
    CURLOPT_TIMEOUT => 20,
  ]);
  $raw = curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $error = curl_error($ch);
  curl_close($ch);

  if ($raw === false || $status < 200 || $status >= 300) {
    r7_json(['success' => false, 'error' => 'Unable to obtain PayPal access token.', 'detail' => $error], 502);
  }
  $data = json_decode((string)$raw, true);
  if (!isset($data['access_token'])) {
    r7_json(['success' => false, 'error' => 'Invalid PayPal token response.'], 502);
  }
  return $data['access_token'];
}

function r7_paypal_request(string $method, string $path, ?array $payload = null, ?string $requestId = null): array {
  $token = r7_paypal_token();
  $headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
  ];
  if ($requestId) $headers[] = 'PayPal-Request-Id: ' . $requestId;

  $ch = curl_init(r7_paypal_base() . $path);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_TIMEOUT => 30,
  ]);
  if ($payload !== null) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_SLASHES));
  }
  $raw = curl_exec($ch);
  $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $error = curl_error($ch);
  curl_close($ch);
  $data = json_decode((string)$raw, true);

  return [
    'ok' => $status >= 200 && $status < 300,
    'status' => $status,
    'data' => is_array($data) ? $data : ['raw' => $raw],
    'error' => $error,
  ];
}

function r7_send_report_email(array $order): string {
  $to = $order['customerEmail'] ?? $order['payerEmail'] ?? '';
  $from = r7_env('R7_DELIVERY_FROM');
  if (!filter_var($to, FILTER_VALIDATE_EMAIL) || !filter_var($from, FILTER_VALIDATE_EMAIL)) {
    return 'skipped_no_email_config';
  }

  $subject = 'Your R7 Fortune Digital Psychological Analysis Report';
  $body = "Hi,\n\nYour payment has been confirmed.\n\nOrder: " . ($order['r7OrderId'] ?? '') .
    "\nProduct: " . R7_PAYPAL_PRODUCT_NAME .
    "\nAmount: USD " . ($order['amount'] ?? '') .
    "\n\nIf your PDF is not attached automatically yet, reply to this email with your order ID and we will resend it.\n\nR7 Fortune";

  $headers = [
    'From: R7 Fortune <' . $from . '>',
    'Reply-To: ' . r7_env('R7_SUPPORT_EMAIL', $from),
    'Content-Type: text/plain; charset=UTF-8',
  ];

  return mail($to, $subject, $body, implode("\r\n", $headers)) ? 'sent' : 'mail_failed';
}

function r7_mark_order(string $r7OrderId, array $patch): array {
  $orders = r7_load_orders();
  $current = $orders[$r7OrderId] ?? ['r7OrderId' => $r7OrderId];
  $orders[$r7OrderId] = array_merge($current, $patch, ['updatedAt' => gmdate('c')]);
  r7_save_orders($orders);
  return $orders[$r7OrderId];
}

function r7_find_order_by_paypal_id(string $paypalOrderId): ?array {
  foreach (r7_load_orders() as $order) {
    if (($order['paypalOrderId'] ?? '') === $paypalOrderId) return $order;
  }
  return null;
}

function r7_cors(): void {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: Content-Type, PayPal-Transmission-Id, PayPal-Transmission-Time, PayPal-Transmission-Sig, PayPal-Cert-Url, PayPal-Auth-Algo');
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;
}
