var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);

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
    const query = client.query("SELECT cm_name||''||cm_address||''||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name FROM customer_master where cm_id=$1",[id]);
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

    const strqry =  "SELECT cm_name||''||cm_address||''||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM CUSTOMER_MASTER cm "+
                    "where cm.cm_status = 0 "+
                    "and LOWER(cm.cm_name) like LOWER($1)"+
                    "and LOWER(cm.cm_mobile) like LOWER($2)"+
                    "and LOWER(cm.cm_gst) like LOWER($3)";

    // SQL Query > Select Data
    const query = client.query(strqry,[req.body.cm_name,req.body.cm_mobile,req.body.cm_gst]);
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

    var singleInsert = 'INSERT INTO customer_master(cm_name, cm_mobile, cm_address, cm_state, cm_city, cm_pin_code, cm_credit, cm_debit, cm_email, cm_gst, cm_opening_credit, cm_opening_debit, cm_contact_person_name, cm_contact_person_number, cm_dept_name, cm_status) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,0) RETURNING *',
        params = [req.body.cm_name,req.body.cm_mobile,req.body.cm_address,req.body.cm_state,req.body.cm_city,req.body.cm_pin_code,req.body.cm_credit,req.body.cm_debit,req.body.cm_email,req.body.cm_gst,req.body.cm_opening_credit,req.body.cm_opening_debit,req.body.cm_contact_person_name,req.body.cm_contact_person_number,req.body.cm_del_city,req.body.cm_dept_name]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
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

    const credit = req.body.cm_credit - req.body.old_cm_credit;
    const debit = req.body.cm_debit - req.body.old_cm_debit;

    var singleInsert = 'UPDATE customer_master SET cm_name=$1, cm_mobile=$2, cm_address=$3, cm_email=$4, cm_state=$5, cm_city=$6, cm_pin_code=$7, cm_credit= cm_credit + $8, cm_opening_credit=$9, cm_debit=cm_debit+$10, cm_opening_debit=$11, cm_gst_no=$12, cm_contact_person_name=$13, cm_contact_person_number=$14, cm_dept_name=$15, cm_updated_at=now() where cm_id=$16 RETURNING *',
        params = [req.body.cm_name,req.body.cm_mobile,req.body.cm_address,req.body.cm_email,req.body.cm_state,req.body.cm_city,req.body.cm_pin_code,credit,req.body.cm_credit,debit,req.body.cm_debit,req.body.cm_gst_no,req.body.cm_contact_person_name,req.body.cm_contact_person_number,req.body.cm_dept_name,id]
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        done();
        client.query('COMMIT;');
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

router.post('/customer/total', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = req.body.search+"%";

    const strqry =  "SELECT count(cm.cm_id) as total "+
                    "from customer_master cm "+
                    "where cm.cm_status=0 "+
                    "and LOWER(cm_name||''||cm_address||''||cm_mobile||''||cm_gst_no ) LIKE LOWER($1);";

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

    const strqry =  "SELECT cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM CUSTOMER_MASTER cm "+
                    "where cm.cm_status = 0 "+
                    "and LOWER(cm_name||''||cm_address||''||cm_mobile||''||cm_gst_no ) LIKE LOWER($1) "+
                    "order by cm.cm_id desc LIMIT $2 OFFSET $3";

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

    const strqry =  "SELECT cm_name||''||cm_address||''||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM CUSTOMER_MASTER cm "+
                    "where cm.cm_status = 0 "+
                    "and LOWER(cm_name||' '||cm_address||' '||cm_mobile||' '||cm_gst_no ) LIKE LOWER($1) "+
                    "order by cm.cm_id desc LIMIT 16";

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
