var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);

router.get('/:mmId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.mmId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    const strqry =  "SELECT mm_name||''||mm_price as mm_search, mm.mm_id, mm.mm_name, mm.mm_price "+
                    "FROM machine_master mm "+
                    "where mm.mm_status = 0 "+
                    "and mm.mm_id = $1";

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

    const strqry =  "SELECT mm_name||''||mm_price as mm_search, mm.mm_id, mm.mm_name, mm.mm_price "+
                    "FROM machine_master mm "+
                    "where mm.mm_status = 0 "+
                    "and LOWER(mm.mm_name) like LOWER($1)";

    // SQL Query > Select Data
    const query = client.query(strqry,[req.body.mm_name]);
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

    var singleInsert = 'INSERT INTO machine_master(mm_name, mm_price, mm_status) values($1,$2,0) RETURNING *',
        params = [req.body.mm_name,req.body.mm_price]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
        return res.json(results);
    });

  done(err);
  });
});

router.post('/edit/:mmId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.mmId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');

    const credit = req.body.cm_credit - req.body.old_cm_credit;
    const debit = req.body.cm_debit - req.body.old_cm_debit;

    var singleInsert = 'UPDATE customer_master SET cm_name=$1, cm_mobile=$2, cm_address=$3, cm_email=$4, cm_state=$5, cm_city=$6, cm_pin_code=$7, cm_credit= cm_credit + $8, cm_opening_credit=$9, cm_debit=cm_debit+$10, cm_opening_debit=$11, cm_gst=$12, cm_contact_person_name=$13, cm_contact_person_number=$14, cm_dept_name=$15, cm_updated_at=now() where cm_id=$16 RETURNING *',
        params = [req.body.cm_name,req.body.cm_mobile,req.body.cm_address,req.body.cm_email,req.body.cm_state,req.body.cm_city,req.body.cm_pin_code,credit,req.body.cm_credit,debit,req.body.cm_debit,req.body.cm_gst,req.body.cm_contact_person_name,req.body.cm_contact_person_number,req.body.cm_dept_name,id]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
        client.query('COMMIT;');
        return res.json(results);
    });

  done(err);
  });
});

router.post('/delete/:mmId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.mmId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');

    var singleInsert = 'UPDATE customer_master SET cm_status=1 WHERE cm_id=($1) RETURNING *',
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

router.post('/machine/total', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = req.body.search+"%";

    const strqry =  "SELECT count(mm.mm_id) as total "+
                    "from machine_master mm "+
                    "where mm.mm_status=0 "+
                    "and LOWER(mm_name||''||mm_price ) LIKE LOWER($1);";

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

router.post('/customer/limit', oauth.authorise(), (req, res, next) => {
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

    const strqry =  "SELECT mm.mm_id, mm.mm_name, mm.mm_price, mm.mm_status, mm.mm_created_at, mm.mm_updated_at "+
                    "FROM machine_master mm "+
                    "where mm.mm_status = 0 "+
                    "and LOWER(mm_name||''||mm_price ) LIKE LOWER($1) "+
                    "order by mm.mm_id desc LIMIT $2 OFFSET $3";

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

    const strqry =  "SELECT mm.mm_id, mm.mm_name, mm.mm_price, mm.mm_status, mm.mm_created_at, mm.mm_updated_at "+
                    "FROM machine_master mm "+
                    "where mm.mm_status = 0 "+
                    "and LOWER(mm_name||' '||mm_price ) LIKE LOWER($1) "+
                    "order by mm.mm_id desc LIMIT 16";

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
