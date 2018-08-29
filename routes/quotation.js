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
    const query = client.query("SELECT * FROM quotation_product_master qtm LEFT OUTER JOIN design_product_master dtm on qtm.qtm_dtm_id = dtm.dtm_id order by qtm_id desc");
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

    var singleInsert = 'INSERT INTO quatation_master(qm_design_no, qm_quotation_no, qm_cm_id, qm_date, qm_ref_no, qm_total_cost, qm_status) values($1,$2,$3,$4,$5,$6,0) RETURNING *',
        params = [quotation.qm_design_no.dm_design_no,quotation.qm_quotation_no,quotation.qm_design_no.dm_cm_id,quotation.qm_design_no.dm_dely_date,quotation.qm_ref_no,quotation.qm_total_cost];
    client.query(singleInsert, params, function (error, result) {
      
        results.push(result.rows[0]); // Will contain your inserted rows

        purchaseMultipleData.forEach(function(product, index) {
        client.query('INSERT INTO quotation_product_master(qpm_part_np, qpm_part_name, qpm_qty, qpm_qm_id, qpm_status)VALUES ($1, $2, $3, $4,  0)',
          [product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].qm_id]);
        });

        machineDetails.forEach(function(value,key){
          client.query("insert into quotation_product_machine_master( qpmm_mm_id, qpmm_qm_id, qpmm_mm_hr, qpmm_total_cost, qpmm_status)VALUES ($1, $2, $3, $4, 0)",
            [value.qpmm_mm_id.mm_id, result.rows[0].qm_id, value.qpmm_mm_hr, value.qpmm_total]);
        });

        done();
        return res.json(results);
    });

  done(err);
  });
});

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
    const query = client.query('SELECT * FROM quatation_master qm inner join customer_master cm on qm.qm_cm_id=cm.cm_id left outer join quotation_product_master qpm on qpm.qpm_qm_id=qm.qm_id where qm_id=$1',[id]);
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

router.get('/product/:quotationId', oauth.authorise(), (req, res, next) => {
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
    const query = client.query('SELECT * FROM quotation_product_master qpm left outer join quatation_master qm on qpm.qpm_qm_id=qm.qm_id where qm_id=$1',[id]);
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

router.get('/machine/:quotationId', oauth.authorise(), (req, res, next) => {
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
    const query = client.query('SELECT * FROM quotation_product_machine_master qpmm left outer join quatation_master qm on qpmm.qpmm_qm_id=qm.qm_id left outer join machine_master mm on qpmm.qpmm_mm_id=mm.mm_id where qm_id=$1',[id]);
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
                    "left outer join customer_master cm on qm.qm_cm_id=cm.cm_id "+
                    "where qm_status=0 "+
                    "and LOWER(qm_quotation_no||''||qm_design_no||''||cm_name) LIKE LOWER($1);";

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

    const strqry =  "SELECT * "+
                    "FROM quatation_master qm "+
                    "left outer join customer_master cm on qm.qm_cm_id=cm.cm_id "+
                    "where qm.qm_status = 0 "+
                    "and LOWER(qm_quotation_no||''||qm_design_no||''||cm_name) LIKE LOWER($1) "+
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

router.get('/view/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id=req.params.quotationId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * FROM quotation_product_master qpm inner join quatation_master qm on qpm.qpm_qm_id=qm.qm_id where qm_id=$1",[id]);
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

router.get('/machine/:quotationId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id=req.params.quotationId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * FROM quotation_product_machine_master qpmm inner join quatation_master qm on qpmm.qpmm_qm_id=qm.qm_id LEFT OUTER JOIN machine_master mm on qpmm.qpmm_mm_id=mm.mm_id where qm_id=$1",[id]);
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

    const strqry =  "SELECT * "+
                    "FROM quatation_master qm "+
                    "where qm.qm_status = 0 "+
                    "and LOWER(qm_quotation_no||''||qm_design_no) LIKE LOWER($1) "+
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

router.get('/view/:quotationnId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id=req.params.quotationnId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * FROM quotation_product_master qpm inner join quatation_master qm on qpm.qpm_qm_id=qm.qm_id where qm_id=$1",[id]);
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