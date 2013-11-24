<?php

$jsonFile = fopen('circuit.json','r');
echo fread($jsonFile,filesize('circuit.json'));
fclose($jsonFile);

?>