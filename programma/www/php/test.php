<?php
set_time_limit(180);

$phpVersion = phpversion();

// Database-test met mysqli
$dbOk = false;
$dbError = "";
$dbMessage = "";

$mysqli = mysqli_init();
if (@mysqli_real_connect($mysqli, "db", getenv("DB_USER"), getenv("DB_PASSWORD"), getenv("DB_NAME"))) {
    $result = $mysqli->query("SELECT VERSION() AS versie");
    $row = $result->fetch_assoc();
    $dbMessage = "Verbonden — MariaDB versie " . $row['versie'];
    $dbOk = true;
    $mysqli->close();
} else {
    $dbError = mysqli_connect_error();
}

function status($ok) {
    return $ok
        ? '<span class="ok">✔ werkt</span>'
        : '<span class="fail">✘ mislukt</span>';
}

// Resultaat ophalen bij de app-container via HTTP
function haalResultaat($pad) {
    $cacheBestand = sys_get_temp_dir() . "/cache_$pad.json";
    $maxLeeftijd = 30; // seconden

    if (file_exists($cacheBestand) && (time() - filemtime($cacheBestand)) < $maxLeeftijd) {
        $data = json_decode(file_get_contents($cacheBestand), true);
        return $data["output"] ?? null;
    }

    $context = stream_context_create(["http" => ["timeout" => 120]]);
    $response = @file_get_contents("http://app:5000/run/$pad", false, $context);
    if ($response === false) {
        return null;
    }

    file_put_contents($cacheBestand, $response);

    $data = json_decode($response, true);
    return $data["output"] ?? null;
}

$pythonResult = haalResultaat("python");
$dotnetResult = haalResultaat("dotnet");
$nodeResult   = haalResultaat("nodejs");
?>


<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <title>Docker Testpagina</title>
    <link rel="stylesheet" href="../css/test.css">
</head>
<body>
    <h1>Docker-omgeving testpagina</h1>

    <div class="card">
        <h2>HTML</h2>
        <p><?= status(true) ?> — als je dit leest, wordt HTML correct weergegeven.</p>
    </div>

    <div class="card">
        <h2>CSS</h2>
        <p id="css-check"><span class="fail">Wachten op check...</span></p>
    </div>

    <div class="card">
        <h2>PHP</h2>
        <p><?= status(true) ?> — PHP-versie: <?= htmlspecialchars($phpVersion) ?></p>
    </div>

    <div class="card">
        <h2>SQL (MariaDB via mysqli)</h2>
        <?php if ($dbOk): ?>
            <p><?= status(true) ?> — laatste bericht uit database: "<?= htmlspecialchars($dbMessage) ?>"</p>
        <?php else: ?>
            <p><?= status(false) ?> — foutmelding: <?= htmlspecialchars($dbError) ?></p>
        <?php endif; ?>
    </div>

    <div class="card">
        <h2>Python</h2>
        <?php if ($pythonResult !== null): ?>
            <pre><?= htmlspecialchars($pythonResult) ?></pre>
        <?php else: ?>
            <p><?= status(false) ?> — de app-container gaf geen antwoord.</p>
        <?php endif; ?>
    </div>

    <div class="card">
        <h2>C#</h2>
        <?php if ($dotnetResult !== null): ?>
            <pre><?= htmlspecialchars($dotnetResult) ?></pre>
        <?php else: ?>
            <p><?= status(false) ?> — de app-container gaf geen antwoord.</p>
        <?php endif; ?>
    </div>

    <div class="card">
        <h2>JavaScript (Node.js, server-side)</h2>
        <?php if ($nodeResult !== null): ?>
            <pre><?= htmlspecialchars($nodeResult) ?></pre>
        <?php else: ?>
            <p><?= status(false) ?> — de app-container gaf geen antwoord.</p>
        <?php endif; ?>
    </div>

    <div class="card">
        <h2>JavaScript (client-side, in de browser)</h2>
        <p id="js-check"><span class="fail">✘ mislukt</span> — als dit verandert, draait JavaScript in je browser.</p>
    </div>
    
    <center>

            <br><br>

        <button class= "btn" onclick="window.location.href = '../index.php'">index</button>

    </center>
    <script>


        // JavaScript-check
        document.getElementById("js-check").innerHTML =
            '<span class="ok">✔ werkt</span> — JavaScript draait in de browser.';

        // CSS-check
        const cssCheck = document.getElementById("css-check");
        const kleur = getComputedStyle(cssCheck.querySelector("span")).color;
        // rgb(243, 139, 168) is de kleur van .fail uit style.css
        if (kleur === "rgb(243, 139, 168)") {
            cssCheck.innerHTML = '<span class="ok">✔ werkt</span> — CSS wordt correct geladen.';
        } else {
            cssCheck.innerHTML = '<span class="fail">✘ mislukt</span> — style.css lijkt niet geladen.';
        }
    </script>
</body>
</html>