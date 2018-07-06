var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);

router.get('/', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT *,pm_name||' - '||pm_price AS PM_SEARCH FROM product_master where pm_status = 0 order by pm_id desc");
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      // pg.end();
      return res.json(results);
    });
  done(err);
  });
});

router.get('/:custId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.custId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM product_master where pm_id=$1',[id]);
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      // pg.end();
      return res.json(results);
    });
  done(err);
  });
});

router.post('/add', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    client.query('INSERT INTO product_master( pm_name, pm_unit, pm_hsn, pm_price, pm_cgst, pm_sgst, pm_status) values($1,$2,$3,$4,$5,$6,0)',[req.body.pm_name,req.body.pm_unit,req.body.pm_hsn,req.body.pm_price,req.body.pm_cgst,req.body.pm_sgst]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM product_master');
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      // pg.end();
      return res.json(results);
    });
  done(err);
  });
});

router.post('/edit/:custId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.custId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    // SQL Query > Insert Data
    client.query('UPDATE product_master SET pm_name=$1, pm_unit=$2, pm_hsn=$3, pm_price=$4, pm_cgst=$5, pm_sgst=$6 where pm_id=$7',[req.body.pm_name,req.body.pm_unit,req.body.pm_hsn,req.body.pm_price,req.body.pm_cgst,req.body.pm_sgst,id]);
    // SQL Query > Select Data
    client.query('COMMIT;');
    const query = client.query('SELECT * FROM product_master');
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      // pg.end();
      return res.json(results);
    });
  done(err);
  });
});

router.post('/delete/:custId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.custId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('UPDATE product_master SET pm_status=1 WHERE pm_id=($1)', [id]);
    // SQL Query > Insert Data
    // client.query('UPDATE customer_master SET cm_code=$1, cm_name=$2, cm_mobile=$3, cm_email=$4, cm_address=$5, cm_city=$6, cm_state=$7, cm_pin_code=$8, cm_car_name=$9, cm_car_model=$10, cm_car_number=$11 where cm_id=$12',[req.body.cm_code,req.body.cm_name,req.body.cm_mobile,req.body.cm_email,req.body.cm_address,req.body.cm_city,req.body.cm_state,req.body.cm_pin_code,req.body.cm_car_name,req.body.cm_car_model,req.body.cm_car_number,id]);
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM product_master');
    query.on('row', (row) => {
      results.push(row);
    });
    query.on('end', () => {
      done();
      // pg.end();
      return res.json(results);
    });
  done(err);
  });
});

module.exports = router;
