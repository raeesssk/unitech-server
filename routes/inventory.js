var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);

router.get('/:imId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.imId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    const strqry =  "SELECT im_part_no||'-'||im_part_name ||' '||(im_quantity) as im_search, im.im_id, im.im_part_no, im.im_part_name, im.im_quantity, im.im_opening_quantity, im.im_price, im.im_mrp, im.im_status, im.im_created_at, im.im_updated_at "+
                    "FROM inventory_master im "+
                    "where im.im_status = 0 "+
                    "and im.im_id = $1";

    // SQL Query > Select Data
    const query = client.query(strqry,[id]);
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

router.post('/checkname', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    const strqry =  "SELECT im_part_no||'-'||im_part_name ||' '||(im_quantity) as im_search, im.im_id, im.im_part_no, im.im_part_name, im.im_quantity, im.im_opening_quantity, im.im_price, im.im_mrp, im.im_status, im.im_created_at, im.im_updated_at "+
                    "FROM inventory_master im "+
                    "where im.im_status = 0 "+
                    "and LOWER(im.im_part_no) like LOWER($1)"+
                    "and LOWER(im.im_part_name) like LOWER($2)";

    // SQL Query > Select Data
    const query = client.query(strqry,[req.body.im_part_no,req.body.im_part_name]);
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

    var singleInsert = 'INSERT INTO inventory_master(im_part_no, im_part_name, im_quantity, im_opening_quantity, im_price, im_mrp, im_status) values($1,$2,$3,$4,$5,$6,0) RETURNING *',
        params = [req.body.im_part_no,req.body.im_part_name,req.body.im_opening_quantity,req.body.im_opening_quantity,req.body.im_price,req.body.im_mrp]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
        return res.json(results);
    });

  done(err);
  });
});

router.post('/edit/:imId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.imId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');


    var cash = req.body.im_opening_quantity - req.body.old_im_opening_quantity;

    var singleInsert = 'UPDATE inventory_master SET im_part_no=$1, im_part_name=$2, im_quantity=im_quantity+$3, im_opening_quantity=$4, im_price=$5, im_mrp=$6, im_updated_at=now() where im_id=$7 RETURNING *',
        params = [req.body.im_part_no,req.body.im_part_name,cash,req.body.im_opening_quantity,req.body.im_price,req.body.im_mrp,id]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
        client.query('COMMIT;');
        return res.json(results);
    });

  done(err);
  });
});

router.post('/delete/:imId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.imId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');

    var singleInsert = 'UPDATE inventory_master SET im_status=1, im_updated_at=now() WHERE im_id=($1) RETURNING *',
        params = [id]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
        client.query('COMMIT;');
        return res.json(results);
    });

  done(err);
  });
});

router.post('/inventory/total', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = req.body.search+"%";

    const strqry =  "SELECT count(im.im_id) as total "+
                    "from inventory_master im "+
                    "where im.im_status=0 "+
                    "and LOWER(im_part_no||''||im_part_name ) LIKE LOWER($1);";

    const query = client.query(strqry,[str]);
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

router.post('/inventory/limit', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = req.body.search+"%";
    // SQL Query > Select Data

    const strqry =  "SELECT im_part_no||'-'||im_part_name ||' '||(im_quantity) as im_search, im.im_id, im.im_part_no, im.im_part_name, im.im_quantity, im.im_opening_quantity, im.im_price, im.im_mrp, im.im_status, im.im_created_at, im.im_updated_at "+
                    "FROM inventory_master im "+
                    "where im.im_status = 0 "+
                    "and LOWER(im_part_no||''||im_part_name ) LIKE LOWER($1) "+
                    "order by im.im_id desc LIMIT $2 OFFSET $3";

    const query = client.query(strqry,[str, req.body.number, req.body.begin]);
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

router.post('/typeahead/search', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = req.body.search+"%";
    // SQL Query > Select Data

    const strqry =  "SELECT im_part_no||'-'||im_part_name ||' '||(im_quantity) as im_search, im.im_id, im.im_part_no, im.im_part_name, im.im_quantity, im.im_opening_quantity, im.im_price, im.im_mrp, im.im_status, im.im_created_at, im.im_updated_at "+
                    "FROM inventory_master im "+
                    "where im.im_status = 0 "+
                    "and LOWER(im_part_no||' - '||im_part_name ) LIKE LOWER($1) "+
                    "order by im.im_id desc LIMIT 16";

    const query = client.query(strqry,[str]);
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
