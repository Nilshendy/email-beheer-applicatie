<?php
// Draait een script uit programma/python en geeft de laatste "RESULT {...}" regel terug als array

function run_python_script($script, $args = [], $stdin = '') {
    $python = getenv('PYTHON_BIN') ?: (PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3');
    $cmd = escapeshellarg($python) . ' ' . escapeshellarg(__DIR__ . '/programma/python/' . $script);
    foreach ($args as $arg) {
        $cmd .= ' ' . escapeshellarg((string)$arg);
    }

    $process = proc_open($cmd, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    if (!is_resource($process)) {
        return ['success' => false, 'message' => 'Python kon niet gestart worden'];
    }

    fwrite($pipes[0], $stdin);
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]);
    $errors = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);

    foreach (array_reverse(explode("\n", trim($output))) as $line) {
        if (strpos($line, 'RESULT ') === 0) {
            $result = json_decode(substr($line, 7), true);
            if (is_array($result)) {
                return $result;
            }
        }
    }

    error_log("Python script $script mislukt: " . $errors);
    return ['success' => false, 'message' => 'Python script mislukt, zie de PHP error log'];
}
?>
