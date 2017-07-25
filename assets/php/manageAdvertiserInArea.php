<?php
/*
 * File is called by ajax.
 * Manipulates with advertising_rotation_frequency - 
 * edit advertiser's frequency or remove advertiser from area
 */

include_once("mysql_connector.php");
ini_set('display_errors', '0');

$action = (isset($_POST['action']) ? $_POST['action'] : null);

$data = array('error' => "Acton not provided");

if ( 'edit-frequency' === $action ) {
    $areaId = (isset($_POST['area-id']) ? intval($_POST['area-id']) : 0);
    $advertiserId = (isset($_POST['advertiser-id']) ? intval($_POST['advertiser-id']) : 0);
    $newFrequency = (isset($_POST['frequency']) ? intval($_POST['frequency']) : null);
    
    if ( (0 < $areaId) && (0 < $advertiserId) && (null !== $newFrequency) && (0 <= $newFrequency) && (100 >= $newFrequency) ) {
        $currFrequencyQ = $mysqli->query(
            "SELECT `frequency` FROM `advertising_rotation_frequency` "
            . "WHERE (`id_advertiser` = {$advertiserId}) AND (`id_area` = {$areaId})");

        if ( $currFrequencyQ && ($currFrequencyRow = $currFrequencyQ->fetch_assoc()) && (0 < intval($currFrequencyRow['frequency'])) ) {
            if ( $mysqli->query("UPDATE `advertising_rotation_frequency` SET `frequency`={$newFrequency} WHERE (`id_advertiser`={$advertiserId}) AND (`id_area`={$areaId})") ) {
                $data = array();
            } else {
                $data['error'] = "DB Error (failed to update record)";
            }
        } else {
            if ( $mysqli->query("INSERT INTO `advertising_rotation_frequency`(`id_advertiser`, `id_area`, `frequency`) VALUES({$advertiserId}, {$areaId}, {$newFrequency})") ) {
                $data = array();
            } else {
                $data['error'] = "DB Error (failed to add record)";
            }
        }
    } else {
        $data['error'] = "invalid request parameters";
    }
} elseif ( 'remove-advertiser' === $action ) {
    $areaId = (isset($_POST['area-id']) ? intval($_POST['area-id']) : 0);
    $advertiserId = (isset($_POST['advertiser-id']) ? intval($_POST['advertiser-id']) : 0);
    
    if ( (0 < $areaId) && (0 < $advertiserId) ) {
        $currFrequencyQ = $mysqli->query(
            "SELECT `frequency` FROM `advertising_rotation_frequency` "
            . "WHERE (`id_advertiser` = {$advertiserId}) AND (`id_area` = {$areaId})");
        if ( $currFrequencyQ && (0 < $currFrequencyQ->num_rows) ) {
            if ( $mysqli->query("DELETE FROM `advertising_rotation_frequency` WHERE (`id_advertiser` = {$advertiserId}) AND (`id_area` = {$areaId})") ) {
                $data = array();
            } else {
                $data['error'] = "DB Error (failed to delete record)";
            }
        } else {
            $data['error'] = "DB Error (record not found)";
        }
    } else {
        $data['error'] = "invalid request parameters";
    }
}

header('Content-Type: application/json');
echo json_encode($data);
