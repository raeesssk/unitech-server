var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);

router.get('/:supId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.supId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    const strqry =  "SELECT sm_name||'-'||sm_address||'-'||sm_mobile as sm_search, sm.sm_id, sm.sm_name, sm.sm_gst_no, sm.sm_address, sm.sm_state, sm.sm_city, sm.sm_pin, sm.sm_mobile, sm.sm_email, sm.sm_debit, sm.sm_opening_debit, sm.sm_credit, sm.sm_opening_credit, sm.sm_contact_person_name, sm.sm_contact_person_number, sm.sm_status, sm.sm_created_at, sm.sm_updated_at "+
                    "FROM supplier_master sm "+
                    "where sm.sm_status = 0 "+
                    "and sm.sm_id=$1";

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

    const strqry =  "SELECT sm_name||'-'||sm_address||'-'||sm_mobile as sm_search, sm.sm_id, sm.sm_name, sm.sm_gst_no, sm.sm_address, sm.sm_state, sm.sm_city, sm.sm_pin, sm.sm_mobile, sm.sm_email, sm.sm_debit, sm.sm_opening_debit, sm.sm_credit, sm.sm_opening_credit, sm.sm_contact_person_name, sm.sm_contact_person_number, sm.sm_status, sm.sm_created_at, sm.sm_updated_at "+
                    "FROM supplier_master sm "+
                    "where sm.sm_status = 0 "+
                    "and LOWER(sm.sm_name) like LOWER($1)"+
                    "and LOWER(sm.sm_address) like LOWER($2)"+
                    "and LOWER(sm.sm_mobile) like LOWER($3)";

    // SQL Query > Select Data
    const query = client.query(strqry,[req.body.sm_name,req.body.sm_mobile,req.body.sm_gst_no]);
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

    var singleInsert = 'INSERT INTO supplier_master(sm_name, sm_gst_no, sm_address, sm_state, sm_city, sm_pin, sm_mobile, sm_email, sm_debit, sm_opening_debit, sm_credit, sm_opening_credit, sm_contact_person_name, sm_contact_person_number, sm_status) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,0) RETURNING *',
        params = [req.body.sm_name,req.body.sm_gst_no,req.body.sm_address,req.body.sm_state,req.body.sm_city,req.body.sm_pin,req.body.sm_mobile,req.body.sm_email,req.body.sm_opening_debit,req.body.sm_opening_debit,req.body.sm_opening_credit,req.body.sm_opening_credit,req.body.sm_contact_person_name,req.body.sm_contact_person_number]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
        return res.json(results);
    });

  done(err);
  });
});

router.post('/edit/:supId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.supId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');

    const credit = req.body.sm_opening_credit - req.body.old_sm_opening_credit;
    const debit = req.body.sm_opening_debit - req.body.old_sm_opening_debit;

    var singleInsert = 'UPDATE supplier_master SET sm_name=$1, sm_gst_no=$2, sm_address=$3, sm_state=$4, sm_city=$5, sm_pin=$6, sm_mobile=$7, sm_email=$8, sm_debit=sm_debit+$9, sm_opening_debit=$10, sm_credit=sm_credit + $11, sm_opening_credit=$12, sm_contact_person_name=$13, sm_contact_person_number=$14, sm_updated_at=now() where sm_id=$15 RETURNING *',
        params = [req.body.sm_name,req.body.sm_gst_no,req.body.sm_address,req.body.sm_state,req.body.sm_city,req.body.sm_pin,req.body.sm_mobile,req.body.sm_email,debit,req.body.sm_opening_debit,credit,req.body.sm_opening_credit,req.body.sm_contact_person_name,req.body.sm_contact_person_number,id]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
        client.query('COMMIT;');
        return res.json(results);
    });

  done(err);
  });
});

router.post('/delete/:supId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.supId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');

    var singleInsert = 'UPDATE supplier_master SET sm_status=1, sm_updated_at=now() WHERE sm_id=($1) RETURNING *',
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

router.get('/details/:vmId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.vmId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const querystr =  "(select im.im_invoice_no as invoice,im.im_date as date,im.im_total_amount as debit,0 as credit,'Invoice' as type, '1' as num from invoice_master im LEFT OUTER JOIN customer_master cm on im.im_cm_id=cm.cm_id where im.im_status=0 and cm.cm_id = $1) UNION "+
                      "(select ''||em.em_id as invoice,em.em_date as date,em.em_amount as debit,em.em_credit as credit,'Cashbook' as type, '2' as num from expense_master em LEFT OUTER JOIN customer_master vm on em.em_cm_id=vm.cm_id where vm.cm_id = $2) order by date,num asc";
    const query = client.query(querystr,[id,id]);
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

router.post('/supplier/total', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = req.body.search+"%";

    const strqry =  "SELECT count(sm.sm_id) as total "+
                    "FROM supplier_master sm "+
                    "where sm.sm_status = 0 "+
                    "and LOWER(sm_name||''||sm_address||''||sm_mobile ) LIKE LOWER($1) ;";

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

router.post('/supplier/limit', oauth.authorise(), (req, res, next) => {
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

    const strqry =  "SELECT sm_name||'-'||sm_address||'-'||sm_mobile as sm_search, sm.sm_id, sm.sm_name, sm.sm_gst_no, sm.sm_address, sm.sm_state, sm.sm_city, sm.sm_pin, sm.sm_mobile, sm.sm_email, sm.sm_debit, sm.sm_opening_debit, sm.sm_credit, sm.sm_opening_credit, sm.sm_contact_person_name, sm.sm_contact_person_number, sm.sm_status, sm.sm_created_at, sm.sm_updated_at "+
                    "FROM supplier_master sm "+
                    "where sm.sm_status = 0 "+
                    "and LOWER(sm_name||''||sm_address||''||sm_mobile ) LIKE LOWER($1) "+
                    "order by sm.sm_id desc LIMIT $2 OFFSET $3";

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

    const strqry =  "SELECT sm_name||'-'||sm_address||'-'||sm_mobile as sm_search, sm.sm_id, sm.sm_name, sm.sm_gst_no, sm.sm_address, sm.sm_state, sm.sm_city, sm.sm_pin, sm.sm_mobile, sm.sm_email, sm.sm_debit, sm.sm_opening_debit, sm.sm_credit, sm.sm_opening_credit, sm.sm_contact_person_name, sm.sm_contact_person_number, sm.sm_status, sm.sm_created_at, sm.sm_updated_at "+
                    "FROM supplier_master sm "+
                    "where sm.sm_status = 0 "+
                    "and LOWER(sm_name||''||sm_address||''||sm_mobile ) LIKE LOWER($1) "+
                    "order by sm.sm_id desc LIMIT 16";

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
