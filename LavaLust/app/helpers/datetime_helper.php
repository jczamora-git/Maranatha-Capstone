<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

if (!function_exists('app_now')) {
    function app_now($format = 'Y-m-d H:i:s')
    {
        return date($format);
    }
}

if (!function_exists('app_today')) {
    function app_today($format = 'Y-m-d')
    {
        return date($format);
    }
}
