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

    var singleInsert = 'INSERT INTO quatation_master(qm_design_no, qm_quotation_no, qm_cm_id, qm_date, qm_ref_no, qm_status) values($1,$2,$3,$4,$5,0) RETURNING *',
        params = [quotation.qm_design_no.dm_design_no,quotation.qm_quotation_no,quotation.qm_design_no.dm_cm_id,quotation.qm_design_no.dm_dely_date,quotation.qm_ref_no];
    client.query(singleInsert, params, function (error, result) {
      
        results.push(result.rows[0]); // Will contain your inserted rows

        purchaseMultipleData.forEach(function(product, index) {
        client.query('INSERT INTO quotation_product_master(qpm_part_np, qpm_part_name, qpm_qty, qpm_qm_id, qpm_status)VALUES ($1, $2, $3, $4,  0)',
          [product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].qm_id]);
        });

        machineDetails.forEach(function(value,key){
          client.query("insert into quotation_product_machine_master( qpmm_mm_id, qpmm_qm_id, qpmm_mm_hr, qpmm_status)VALUES ($1, $2, $3, 0)",
            [value.qpmm_mm_id.mm_id, result.rows[0].qm_id, value.qpmm_mm_hr]);
          client.query("update quatation_master set qm_qpmm_id=$1 where qm_id=$2",[value.qpmm_mm_id.mm_id,result.rows[0].qm_id]);
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
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    var singleInsert = 'update quatation_master set qm_design_no=$1, qm_quotation_no=$2, qm_cm_id=$3, qm_date=$4, qm_ref_no=$5, qm_updated_at=now() where qm_id=$6 RETURNING *',
        params = [req.body.qm_design_no.dm_design_no,req.body.qm_quotation_no,req.body.qm_cm_id.cm_id,req.body.qm_date,req.body.qm_ref_no,id];
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        
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
  const oldDetails=req.body.oldDetails;
  const personalDetails=req.body.personalDetails;
  // const removeDetails=req.body.removeDetails;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    var singleInsert = 'update quatation_master set qm_design_no=$1, qm_quotation_no=$2, qm_cm_id=$3, qm_date=$4, qm_ref_no=$5, qm_updated_at=now() where qm_id=$6 RETURNING *',
        params = [quotation.qm_design_no.dm_design_no,quotation.qm_quotation_no,quotation.qm_cm_id.cm_id,quotation.qm_date,quotation.qm_ref_no,id];
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        
        // remove.forEach(function(product, index) {
        //   client.query('delete from public.quotation_product_master where qtm_id=$1',[product.qtm_id]);
        // });

        oldDetails.forEach(function(product, index) {
          client.query('update quotation_product_master set qtm_part_no=$1, qtm_part_name=$2, qtm_qty=$3, qtm_cost=$4, qtm_total=$5, qtm_qm_id=$6, qtm_updated_at=now() where qtm_id=$7',
          	[product.qtm_part_no,product.qtm_part_name,product.qtm_qty,product.qtm_cost,product.qtm_total,result.rows[0].qm_id,product.qtm_id]);
        });

        personalDetails.forEach(function(product, index) {
        client.query('INSERT INTO quotation_product_master(qtm_part_no, qtm_part_name, qtm_qty, qtm_cost, qtm_total, qtm_qm_id, qtm_status)VALUES ($1, $2, $3, $4, $5, $6  0)',
          [product.qtm_part_no,product.qtm_part_name,product.qtm_qty,product.qtm_cost,product.qtm_total,result.rows[0].qm_id]);
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

router.get('/views/:designId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id=req.params.designId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * FROM design_master dm LEFT OUTER JOIN customer_master cm on dm.dm_cm_id=cm.cm_id LEFT OUTER JOIN design_product_master dtm on dtm.dtm_dm_id=dm.dm_id  where dm_id=$1",[id]);
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