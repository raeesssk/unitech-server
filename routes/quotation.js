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
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM quatation_master qm "+
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
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name, "+
                    "qpm.qpm_id, qpm.qpm_part_name, qpm.qpm_qty, qpm.qpm_part_no, qpm.qpm_total_cost "+
                    "FROM quotation_product_master qpm "+
                    "inner join quatation_master qm on qpm.qpm_qm_id=qm.qm_id "+
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
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name, "+
                    "mm_name||'-'||mm_price as mm_search, mm.mm_id, mm.mm_name, mm.mm_price, "+
                    "qpm.qpm_id, qpm.qpm_part_name, qpm.qpm_qty, qpm.qpm_part_no, qpm.qpm_total_cost, "+
                    "qpm.qpmm_id, qpm.qpmm_total_cost, qpm.qpmm_mm_hr "+
                    "FROM quotation_product_machine_master qpmm "+
                    "inner join quotation_product_master qpm on qpmm.qpmm_qpm_id=qpm.qpm_id "+
                    "inner join machine_master mm on qpmm.qpmm_mm_id=mm.mm_id "+
                    "inner join quatation_master qm on qpm.qpm_qm_id=qm.qm_id "+
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

    var singleInsert = 'INSERT INTO quatation_master(qm_dm_id, qm_quotation_no, qm_date, qm_ref, qm_total_cost, qm_comment, qm_status) values($1,$2,$3,$4,$5,$6,0) RETURNING *',
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
  const personalDetails=req.body.personalDetails;
  const machineDetails = req.body.machineDetails;
  const oldProductDetails = req.body.oldProductDetails;
  const removeProductDetails = req.body.removeProductDetails;
  const oldMachineDetails = req.body.oldMachineDetails;
  const removeMachineDetails = req.body.removeMachineDetails;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    var singleInsert = 'update quatation_master set  qm_ref_no=$1,qm_total_cost=$2, qm_updated_at=now() where qm_id=$3 RETURNING *',
        params = [quotation.qm_ref_no,quotation.qm_total_cost,id];
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        
        removeProductDetails.forEach(function(product, index) {
          client.query('delete from quotation_product_master where qpm_id=$1',[product.qpm_id]);
        });

        oldProductDetails.forEach(function(val, index) {
          client.query('update quotation_product_master set qpm_part_np=$1, qpm_part_name=$2, qpm_qty=$3, qpm_qm_id=$4, qpm_updated_at=now() where qpm_id=$5',
          	[val.qpm_part_np,val.qpm_part_name,val.qpm_qty,result.rows[0].qm_id,val.qpm_id]);
        });

        personalDetails.forEach(function(product, index) {
        client.query('INSERT INTO quotation_product_master(qpm_part_no, qpm_part_name, qpm_qty, qpm_qm_id, qpm_status)VALUES ($1, $2, $3, $4, 0)',
          [product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].qm_id]);
        });

        removeMachineDetails.forEach(function(product, index) {
          client.query('delete from public.quotation_product_machine_master where qpmm_id=$1',[product.qpmm_id]);
        });
        
        oldMachineDetails.forEach(function(product, index) {
          client.query('update quotation_product_machine_master set qpmm_mm_id=$1, qpmm_mm_hr=$2, qpmm_qm_id=$3, qpmm_total_cost=$4, qpmm_updated_at=now() where qpmm_id=$5',
            [product.qpmm_mm_id, product.qpmm_mm_hr, result.rows[0].qm_id, product.qpmm_total_cost, product.qpmm_id]);
        });
        
        machineDetails.forEach(function(value, index) {
        client.query('INSERT INTO quotation_product_machine_master(qpmm_mm_id, qpmm_qm_id, qpmm_mm_hr, qpmm_total_cost, qpmm_status)VALUES ($1, $2, $3, $4, 0)',
          [value.qpmm_mm_id.mm_id, result.rows[0].qm_id, value.qpmm_mm_hr, value.qpmm_total_cost]);
        });
        
        console.log(results);
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

    var singleInsert = "update quatation_master set qm_status=1, qm_updated_at=now() where qm_id=$1 RETURNING *",
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
    const query = client.query("SELECT * from quatation_master order by qm_id desc limit 1");
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
                    "from quatation_master qm "+
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

    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM quatation_master qm "+
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

    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_created_at, qm.qm_updated_at, "+
                    "dm.dm_id, dm.dm_design_no, dm.dm_mft_date, dm.dm_dely_date, dm.dm_project_no, dm.dm_po_no, dm.dm_po_date, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM quatation_master qm "+
                    "inner join design_master dm on qm.qm_dm_id=dm.dm_id "+
                    "inner join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where qm.qm_status = 0 "+
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