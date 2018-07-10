var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var multer = require('multer'); 

var filenamestore = "";

var pool = new pg.Pool(config);

router.get('/:empId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.empId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data

    const strqry =  "SELECT emp_no||''||emp_name||''||emp_mobile as emp_search, emp.emp_id, emp.emp_name, emp.emp_mobile, emp.emp_designation, emp.emp_qualification, emp.emp_res_address, emp.emp_cor_address, emp.emp_aadhar, emp.emp_pan, emp.emp_bank_name, emp.emp_account_no, emp.emp_ifsc_code, emp.emp_branch, emp.emp_email, emp.emp_image, emp.emp_created_at, emp.emp_updated_at, emp.emp_status, emp.emp_birth_date, emp.emp_no "+
                    "FROM employee_master emp "+
                    "where emp.emp_status = 0 "+
                    "and emp.emp_id = $1";

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

router.post('/checkname', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    const strqry =  "SELECT emp_no||''||emp_name||''||emp_mobile as emp_search, emp.emp_id, emp.emp_name, emp.emp_mobile, emp.emp_designation, emp.emp_qualification, emp.emp_res_address, emp.emp_cor_address, emp.emp_aadhar, emp.emp_pan, emp.emp_bank_name, emp.emp_account_no, emp.emp_ifsc_code, emp.emp_branch, emp.emp_email, emp.emp_image, emp.emp_created_at, emp.emp_updated_at, emp.emp_status, emp.emp_birth_date, emp.emp_no "+
                    "FROM employee_master emp "+
                    "where emp.emp_status = 0 "+
                    "and LOWER(emp.emp_no) like LOWER($1)"+
                    "and LOWER(emp.emp_name) like LOWER($2)"+
                    "and LOWER(emp.emp_mobile) like LOWER($3)";

    // SQL Query > Select Data
    const query = client.query(strqry,[req.body.emp_no,req.body.emp_name,req.body.emp_mobile]);
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

  var Storage = multer.diskStorage({
      destination: function (req, file, callback) {
          // callback(null, "./images");
            callback(null, "../nginx/html/images");
      },
      filename: function (req, file, callback) {
          var fi = file.fieldname + "_" + Date.now() + "_" + file.originalname;
          filenamestore = "../images/"+fi;
          callback(null, fi);
      }
  });

  var upload = multer({ storage: Storage }).array("emp_image", 3); 

  upload(req, res, function (err) { 
    if (err) { 
        return res.end("Something went wrong!"+err); 
    } 
    pool.connect(function(err, client, done){
      if(err) {
        done();
        console.log("the error is"+err);
        return res.status(500).json({success: false, data: err});
      }
      var singleInsert = 'INSERT INTO employee_master(emp_name, emp_mobile, emp_designation, emp_qualification, emp_res_address, emp_cor_address, emp_aadhar, emp_pan, emp_bank_name, emp_account_no, emp_ifsc_code, emp_branch, emp_email, emp_image, emp_birth_date, emp_no, emp_status) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,0) RETURNING *',
          params = [req.body.emp_name,req.body.emp_mobile,req.body.emp_designation,req.body.emp_qualification,req.body.emp_res_address,req.body.emp_cor_address,req.body.emp_aadhar,req.body.emp_pan,req.body.emp_bank_name,req.body.emp_account_no,req.body.emp_ifsc_code,req.body.emp_branch,req.body.emp_email,filenamestore,req.body.emp_birth_date,req.body.emp_no]
      client.query(singleInsert, params, function (error, result) {
          results.push(result.rows[0]); // Will contain your inserted rows
          done();
          return res.json(results);
      });
      done(err);
    });
  }); 
});

router.post('/edit/:empId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.empId;
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

router.post('/delete/:empId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.empId;
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

router.post('/employee/total', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = req.body.search+"%";

    const strqry =  "SELECT count(emp.emp_id) as total "+
                    "from employee_master emp "+
                    "where emp.emp_status=0 "+
                    "and LOWER(emp_name||''||emp_mobile||''||emp_designation||''||emp_no ) LIKE LOWER($1);";

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

router.post('/employee/limit', oauth.authorise(), (req, res, next) => {
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

    const strqry =  "SELECT emp.emp_id, emp.emp_name, emp.emp_mobile, emp.emp_designation, emp.emp_qualification, emp.emp_res_address, emp.emp_cor_address, emp.emp_aadhar, emp.emp_pan, emp.emp_bank_name, emp.emp_account_no, emp.emp_ifsc_code, emp.emp_branch, emp.emp_email, emp.emp_image, emp.emp_created_at, emp.emp_updated_at, emp.emp_status, emp.emp_birth_date, emp.emp_no "+
                    "FROM employee_master cm "+
                    "where emp.emp_status = 0 "+
                    "and LOWER(emp_name||''||emp_mobile||''||emp_designation||''||emp_no ) LIKE LOWER($1) "+
                    "order by emp.emp_id desc LIMIT $2 OFFSET $3";

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

    const strqry =  "SELECT emp_no||''||emp_name||''||emp_mobile as emp_search, emp.emp_id, emp.emp_name, emp.emp_mobile, emp.emp_designation, emp.emp_qualification, emp.emp_res_address, emp.emp_cor_address, emp.emp_aadhar, emp.emp_pan, emp.emp_bank_name, emp.emp_account_no, emp.emp_ifsc_code, emp.emp_branch, emp.emp_email, emp.emp_image, emp.emp_created_at, emp.emp_updated_at, emp.emp_status, emp.emp_birth_date, emp.emp_no "+
                    "FROM employee_master cm "+
                    "where emp.emp_status = 0 "+
                    "and LOWER(emp_name||''||emp_mobile||''||emp_designation||''||emp_no ) LIKE LOWER($1) "+
                    "order by emp.emp_id desc LIMIT 16";

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
