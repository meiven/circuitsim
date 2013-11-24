<?php

$jsonstring = $_POST['json'];
$jsonFile = fopen('circuit.json','w+');
fwrite($jsonFile,$jsonstring);
fclose($jsonFile);

?>