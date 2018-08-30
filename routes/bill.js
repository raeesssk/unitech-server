var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);



router.post('/add', oauth.authorise(), (req, res, next) => {
  const results = [];
  const bill = req.body.bill;
  // const purchaseMultipleData=req.body.purchaseMultipleData;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }


    var billInsert = 'INSERT INTO public.bill_master( bm_qm_id, bm_invoice_no, bm_cm_id, bm_date,  bm_status)VALUES ($1, $2, $3, $4, 0) RETURNING *',
        params = [bill.bm_qm_id.qm_id,bill.bm_invoice_no,bill.bm_cm_id.cm_id,bill.bm_date]
    client.query(billInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows

      purchaseMultipleData.forEach(function(product, index) {
        client.query('INSERT INTO bill_product_master(bpm_part_no, bpm_part_name, bpm_qty, bpm_cost, bpm_total, bpm_bm_id  bpm_status)VALUES ($1, $2, $3, $4, $5, $6, 0)',
          [product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].bm_id]);
        
          
      });

      // client.query('COMMIT;');
      done();
      return res.json(results);
    });
  done(err);
  });
});

router.get('/:billId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.designId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM design_master dm inner join customer_master cm on dm.dm_cm_id=cm.cm_id left outer join design_tmaster dtm on dtm.dtm_dm_id=dm.dm_id where dm_id=$1',[id]);
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
router.get('/product/:billId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.designId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM design_master dm left outer join design_tmaster dtm on dtm.dtm_dm_id=dm.dm_id where dm_id=$1',[id]);
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

router.post('/edit/:billId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.designId;
  const design=req.params.design;
  const oldDetails=req.params.oldDetails;
  const personalDetails=req.params.personalDetails;
  const removeDetails=req.params.removeDetails;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    var designInsert = 'update public.design_master set dm_design_no=$1, dm_cm_id=$2, dm_mft_date=$3, dm_dely_date=$4, dm_project_no=$5, dm_po_no=$6, dm_po_date=$7, dm_updated_at=now() where dm_id=$8 RETURNING *',
        params = [design.dm_design_no,design.dm_cm_id.cm_id,design.dm_mft_date,design.dm_dely_date,design.dm_project_no,design.dm_po_no,design.dm_po_date,id];
    client.query(designInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        
        removeDetails.forEach(function(product, index) {
          client.query('delete from public.design_tmaster where dtm_id=$1',[product.dtm_id]);
        });

        oldDetails.forEach(function(product, index) {
          client.query('update design_tmaster set dtm_part_no=$1, dtm_part_name=$2, dtm_qty=$3, dtm_dm_id=$4, dtm_updated_at=now() where dtm_id=$5',[product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].dm_id,product.dtm_id]);
        });

        personalDetails.forEach(function(product, index) {
        client.query('INSERT INTO design_tmaster(dtm_part_no, dtm_part_name, dtm_qty, dtm_dm_id, dtm_status)VALUES ($1, $2, $3, $4,  0)',
          [product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].dm_id]);
        //client.query('update design_tmaster set dtm_part_no=$1, dtm_part_name=$2, dtm_qty=$3, dtm_updated_at=now() where dtm_id=$4',[product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].dm_id]);
        });

        client.query('COMMIT;');
        done();
        return res.json(results);
    });

    done(err);
  });
});

router.post('/delete/:billId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.billId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');

    var billInsert = "update bill_master set bm_status=1, bm_updated_at=now() where bm_id=$1 RETURNING *",
        params = [id]
    client.query(billInsert, params, function (error, result) {
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
    const query = client.query("SELECT * from bill_master order by bm_id desc limit 1");
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

router.post('/bill/total', oauth.authorise(), (req, res, next) => {
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
    const strqry =  "SELECT count(bm_id) as total "+
                    "from bill_master bm "+
                    "left outer join customer_master cm on bm.bm_cm_id=cm.cm_id "+
                    "left outer join quotation_master qm on bm.bm_qm_id=qm.qm_id "+
                    "where bm_status=0 "+
                    "and LOWER(bm_invoice_no||''||qm_quotation_no||''||cm_name) LIKE LOWER($1);";

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

router.post('/bill/limit', oauth.authorise(), (req, res, next) => {
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

    const strqry =  "SELECT * "+
                    "FROM bill_master bm "+
                    "left outer join customer_master cm on bm.bm_cm_id=cm.cm_id "+
                    "left outer join quotation_master qm on bm.bm_qm_id=qm.qm_id "+
                    "where bm_status=0 "+
                    "and LOWER(bm_invoice_no||''||qm_quotation_no||''||cm_name) LIKE LOWER($1) "+
                    "order by bm.bm_id desc LIMIT $2 OFFSET $3";

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


router.get('/view/:billId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id=req.params.designId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * FROM design_tmaster dtm inner join design_master dm on dtm.dtm_dm_id=dm.dm_id where dm_id=$1",[id]);
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