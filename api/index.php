<?php
require_once __DIR__.'/db.php'; require_once __DIR__.'/utils.php';
$method=$_SERVER['REQUEST_METHOD']; $path=isset($_SERVER['PATH_INFO'])?trim($_SERVER['PATH_INFO'],'/') : '';
$segments=$path===''?[]:explode('/',$path); $resource=$segments[0]??''; $id=isset($segments[1])?intval($segments[1]):null;
$resources = [
  'agricultural_products'=>[
    'table'=>'agricultural_products',
    'pk'=>'id',
    'cols'=>['product_name','category','growing_date','harvest_date','storage_requirements','shelf_life','packaging_details']
  ],
'agri_inputs' => [
  'table' => 'agri_inputs',
  'pk' => 'id',
  'cols' => [
    'item',
    'quantity',
    'unit',
    'date_received',
    'input_type',
    'name',
    'stock_level',
    'usage_rate_per_week',
    'procurement_date'
  ]
],

  'perishable_products'=>[
    'table'=>'perishable_products',
    'pk'=>'id',
    'cols'=>['name','category','storage_requirement','shelf_life','packaging_details','supplier_info','expiry_date']
  ],
  'product_tracking'=>[
    'table'=>'product_tracking',
    'pk'=>'id',
    'cols'=>['product_id','name','origin','destination','move_date','expiry_date']
  ],
  'post_harvest'=>[
    'table'=>'post_harvest',
    'pk'=>'id',
    'cols'=>['product_name','storage_location','stock_kg','status','expiry_date']
  ],
  'harvested_crops'=>[
    'table'=>'harvested_crops',
    'pk'=>'id',
    'cols'=>['name','quantity_kg','storage_condition','movement_details','expiry_date']
  ],
'inventory' => [
  'table' => 'inventory',
  'pk'    => 'inventory_id',
  'cols'  => [
    'item_name',
    'amount',
    'unit',
    'expiry_date',
    'date_entered',
    'destination',
    'warehouse',
    'notes'
  ]
],

  'market_data'=>[
    'table'=>'market_data',
    'pk'=>'id',
    'cols'=>['market_name','product','price_per_unit','price_date']
  ],
  'storage_env'=>[
    'table'=>'storage_env',
    'pk'=>'id',
    'cols'=>['location','temperature_c','humidity_pct','status']
  ]
];

$pdo=get_pdo();
if($resource==='login'){ if($method!=='POST') json_out(['error'=>'Method not allowed'],405); $b=json_input(); $u=$b['username']??''; $p=$b['password']??'';
$s=$pdo->prepare('SELECT id,username,password_hash,role FROM users WHERE username=:u LIMIT 1'); $s->execute([':u'=>$u]); $user=$s->fetch();
if($user && password_verify($p,$user['password_hash'])){ $_SESSION['user_id']=$user['id']; $_SESSION['role']=$user['role']; json_out(['ok'=>true,'user'=>['id'=>$user['id'],'username'=>$user['username'],'role'=>$user['role']]]); }
json_out(['error'=>'Invalid credentials'],401); }
if($resource==='logout'){ session_destroy(); json_out(['ok'=>true]); }
require_login();
if(!isset($resources[$resource])) json_out(['error'=>'Not found'],404);
$cfg=$resources[$resource]; $table=$cfg['table']; $allowed=$cfg['cols'];
switch($method){
  
  case 'GET':
    if($id){ $s=$pdo->prepare("SELECT * FROM `$table` WHERE id=:id"); $s->execute([':id'=>$id]); $row=$s->fetch(); if(!$row) json_out(['error'=>'Not found'],404); json_out($row); }
    $limit=isset($_GET['limit'])?max(1,min(500,intval($_GET['limit']))):200; $offset=isset($_GET['offset'])?max(0,intval($_GET['offset'])):0;
    $s=$pdo->prepare("SELECT * FROM `$table` ORDER BY id DESC LIMIT :limit OFFSET :offset"); $s->bindValue(':limit',$limit,PDO::PARAM_INT); $s->bindValue(':offset',$offset,PDO::PARAM_INT); $s->execute(); json_out($s->fetchAll()); break;
  case 'POST':
    $b=json_input(); $data=sanitize_patch($b,$allowed); if(empty($data)) json_out(['error'=>'No valid fields'],400);
    if($resource==='users' && isset($b['password'])){ $data['password_hash']=password_hash($b['password'], PASSWORD_DEFAULT); }
    $cols=array_keys($data); $ph=array_map(fn($k)=>":$k",$cols); $sql="INSERT INTO `$table` (`".implode("`,`",$cols)."`) VALUES (".implode(',', $ph).")";
    $s=$pdo->prepare($sql); $s->execute($data); $newId=intval($pdo->lastInsertId()); $s=$pdo->prepare("SELECT * FROM `$table` WHERE id=:id"); $s->execute([':id'=>$newId]); json_out($s->fetch(),201); break;
  case 'PUT': case 'PATCH':
    if(!$id) json_out(['error'=>'Missing id'],400); $b=json_input(); $data=sanitize_patch($b,$allowed); if(empty($data)) json_out(['error'=>'No valid fields'],400);
    $set=implode(', ', array_map(fn($k)=>"`$k`=:$k", array_keys($data))); $data['id']=$id; $s=$pdo->prepare("UPDATE `$table` SET $set WHERE id=:id"); $s->execute($data);
    $s=$pdo->prepare("SELECT * FROM `$table` WHERE id=:id"); $s->execute([':id'=>$id]); json_out($s->fetch()); break;
  case 'DELETE':
    if(!$id) json_out(['error'=>'Missing id'],400); $s=$pdo->prepare("DELETE FROM `$table` WHERE id=:id"); $s->execute([':id'=>$id]); json_out(['ok'=>true]); break;
  default: json_out(['error'=>'Method not allowed'],405);
}?>