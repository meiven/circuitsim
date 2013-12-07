<?php

$jsonString = $_POST['json'];
$jsonFile = fopen('circuit.json','w+');
fwrite($jsonFile,$jsonString);
fclose($jsonFile);

?>