var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);


router.get('/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.quotationId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_is_approve, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM quotation_master qm "+
                    "inner join design_master dm on qm.qm_dm_id=dm.dm_id "+
                    "inner join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where qm.qm_id=$1";

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

router.get('/details/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.quotationId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_is_approve, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name, "+
                    "qpm.qpm_id, qpm.qpm_part_name, qpm.qpm_qty, qpm.qpm_part_no, qpm.qpm_total_cost "+
                    "FROM quotation_product_master qpm "+
                    "inner join quotation_master qm on qpm.qpm_qm_id=qm.qm_id "+
                    "inner join design_master dm on qm.qm_dm_id=dm.dm_id "+
                    "inner join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where qm.qm_id=$1";

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

router.get('/details/machine/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.quotationId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_is_approve, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name, "+
                    "mm_name||'-'||mm_price as mm_search, mm.mm_id, mm.mm_name, mm.mm_price, "+
                    "qpm.qpm_id, qpm.qpm_part_name, qpm.qpm_qty, qpm.qpm_part_no, qpm.qpm_total_cost, "+
                    "qpmm.qpmm_id, qpmm.qpmm_total_cost, qpmm.qpmm_mm_hr "+
                    "FROM quotation_product_machine_master qpmm "+
                    "inner join quotation_product_master qpm on qpmm.qpmm_qpm_id=qpm.qpm_id "+
                    "inner join machine_master mm on qpmm.qpmm_mm_id=mm.mm_id "+
                    "inner join quotation_master qm on qpm.qpm_qm_id=qm.qm_id "+
                    "inner join design_master dm on qm.qm_dm_id=dm.dm_id "+
                    "inner join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where qpm.qpm_id=$1";

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

router.post('/add', oauth.authorise(), (req, res, next) => {
  const results = [];
  const quotation=req.body.quotation;
  const purchaseMultipleData=req.body.purchaseMultipleData;
  const machineDetails=req.body.machineDetails
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');

    var singleInsert = 'INSERT INTO quotation_master(qm_dm_id, qm_quotation_no, qm_date, qm_ref, qm_total_cost, qm_comment, qm_is_approve, qm_status) values($1,$2,$3,$4,$5,$6,0,0) RETURNING *',
        params = [quotation.qm_dm_id.dm_id,quotation.qm_quotation_no,quotation.qm_date,quotation.qm_ref,quotation.qm_total_cost, quotation.qm_comment];
    client.query(singleInsert, params, function (error, result) {
      
        results.push(result.rows[0]); // Will contain your inserted rows

        purchaseMultipleData.forEach(function(product, index) {

          var singleInsertPro = 'INSERT INTO quotation_product_master(qpm_qm_id, qpm_part_name, qpm_qty, qpm_part_no, qpm_total_cost)VALUES ($1, $2, $3, $4, $5) RETURNING *',
          paramsPro = [result.rows[0].qm_id,product.dtm_part_name,product.dtm_qty,product.dtm_part_no,product.dtm_total_cost];
          
          client.query(singleInsertPro, paramsPro, function (errorPro, resultPro) {

            var maclist = product.machineDetails;
            maclist.forEach(function(value,key){
              client.query("insert into quotation_product_machine_master( qpmm_mm_id, qpmm_qpm_id, qpmm_mm_hr, qpmm_total_cost)VALUES ($1, $2, $3, $4)",
                [value.qpmm_mm_id.mm_id, resultPro.rows[0].qpm_id, value.qpmm_mm_hr, parseFloat(value.qpmm_mm_id.mm_price * value.qpmm_mm_hr)]);
            });

          });
        
        });

        client.query('COMMIT;');
        done();
        return res.json(results);
    });

  done(err);
  });
});

router.post('/edit/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.quotationId;
  const quotation=req.body.quotation;
  const purchaseMultipleData=req.body.purchaseMultipleData;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    var singleInsert = 'update quotation_master set  qm_ref=$1, qm_date=$2, qm_total_cost=$3, qm_comment=$4, qm_updated_at=now() where qm_id=$5 RETURNING *',
        params = [quotation.qm_ref, quotation.qm_date, quotation.qm_total_cost, quotation.qm_comment, id];
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        
        purchaseMultipleData.forEach(function(product, index) {

            var maclist = product.newMachineDetails;
            var remmaclist = product.removeMachineDetails;


            remmaclist.forEach(function(value,key){
              client.query("delete from quotation_product_machine_master where qpmm_id = $1",
                [value.qpmm_id]);
            });

            maclist.forEach(function(value,key){
              client.query("insert into quotation_product_machine_master( qpmm_mm_id, qpmm_qpm_id, qpmm_mm_hr, qpmm_total_cost)VALUES ($1, $2, $3, $4)",
                [value.qpmm_mm_id.mm_id, product.qpm_id, value.qpmm_mm_hr, parseFloat(value.qpmm_mm_id.mm_price * value.qpmm_mm_hr)]);
            });
        
        });

        client.query('COMMIT;');
        done();
        return res.json(results);
    });

    done(err);
  });
});

router.post('/delete/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.quotationId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');

    var singleInsert = "update quotation_master set qm_status=1, qm_is_approve=0, qm_updated_at=now() where qm_id=$1 RETURNING *",
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

router.post('/isapprove/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.quotationId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');

    var singleInsert = "update quotation_master set qm_is_approve=1, qm_updated_at=now() where qm_id=$1 RETURNING *",
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

router.post('/isapprove/pending/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.quotationId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');

    var singleInsert = "update quotation_master set qm_is_approve=0, qm_updated_at=now() where qm_id=$1 RETURNING *",
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

router.post('/serial/no', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * from quotation_master order by qm_id desc limit 1");
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

router.post('/quotation/total', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = "%"+req.body.search+"%";

    console.log(str);
    const strqry =  "SELECT count(qm_id) as total "+
                    "from quotation_master qm "+
                    "inner join design_master dm on qm.qm_dm_id=dm.dm_id "+
                    "inner join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where LOWER(qm_quotation_no||''||dm_design_no||''||cm_name) LIKE LOWER($1);";

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

router.post('/quotation/limit', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = "%"+req.body.search+"%";
    // SQL Query > Select Data

    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_is_approve, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM quotation_master qm "+
                    "inner join design_master dm on qm.qm_dm_id=dm.dm_id "+
                    "inner join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where LOWER(qm_quotation_no||''||dm_design_no||''||cm_name) LIKE LOWER($1) "+
                    "order by qm.qm_id desc LIMIT $2 OFFSET $3";

    const query = client.query(strqry,[ str, req.body.number, req.body.begin]);
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
    const str = "%"+req.body.search+"%";
    // SQL Query > Select Data

    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_is_approve, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM quotation_master qm "+
                    "inner join design_master dm on qm.qm_dm_id=dm.dm_id "+
                    "inner join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where qm.qm_status = 0 "+
                    "where  qm.qm_is_approve=1 "+
                    "and LOWER(qm_quotation_no) LIKE LOWER($1) "+
                    "order by qm.qm_id desc LIMIT 10";

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