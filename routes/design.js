var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);



router.post('/add', oauth.authorise(), (req, res, next) => {
  const results = [];
  const purchasedesignData = req.body.design;
  const purchaseMultipleData=req.body.purchaseMultipleData;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }


    var designInsert = 'INSERT INTO public.design_master( dm_design_no, dm_cm_id, dm_mft_date, dm_dely_date, dm_project_no, dm_po_no, dm_po_date, dm_status)VALUES ($1, $2, $3, $4, $5, $6, $7, 0) RETURNING *',
        params = [purchasedesignData.dm_design_no,purchasedesignData.dm_cm_id.cm_id,purchasedesignData.dm_mft_date,purchasedesignData.dm_dely_date,purchasedesignData.dm_project_no,purchasedesignData.dm_po_no,purchasedesignData.dm_po_date]
    client.query(designInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows

      purchaseMultipleData.forEach(function(product, index) {
        client.query('INSERT INTO design_product_master(dtm_part_no, dtm_part_name, dtm_qty, dtm_dm_id, dtm_status)VALUES ($1, $2, $3, $4,  0)',
          [product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].dm_id]);
        
          
      });

      // client.query('COMMIT;');
      done();
      return res.json(results);
    });
  done(err);
  });
});

router.get('/:designId', oauth.authorise(), (req, res, next) => {
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
    const query = client.query('SELECT * FROM design_master dm inner join customer_master cm on dm.dm_cm_id=cm.cm_id left outer join design_product_master dtm on dtm.dtm_dm_id=dm.dm_id where dm_id=$1',[id]);
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
router.get('/product/:designId', oauth.authorise(), (req, res, next) => {
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
    const query = client.query('SELECT * FROM design_master dm left outer join design_product_master dtm on dtm.dtm_dm_id=dm.dm_id where dm_id=$1',[id]);
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

router.post('/edit/:designId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.designId;
  const design=req.body.design;
  const oldDetails=req.body.oldDetails;
  const personalDetails=req.body.personalDetails;
  const removeDetails=req.body.removeDetails;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    var designInsert = 'update public.design_master set  dm_cm_id=$1, dm_mft_date=$2, dm_dely_date=$3, dm_project_no=$4, dm_po_no=$5, dm_po_date=$6, dm_updated_at=now() where dm_id=$7 RETURNING *',
        params = [design.dm_cm.cm_id,design.dm_mft_date,design.dm_dely_date,design.dm_project_no,design.dm_po_no,design.dm_po_date,id];
    client.query(designInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        
          removeDetails.forEach(function(product, index) {
          client.query('delete from public.design_product_master where dtm_id=$1',[product.dtm_id]);
        });

        oldDetails.forEach(function(product, index) {
          client.query('update design_product_master set dtm_part_no=$1, dtm_part_name=$2, dtm_qty=$3, dtm_dm_id=$4, dtm_updated_at=now() where dtm_id=$5',[product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].dm_id,product.dtm_id]);
        });

        personalDetails.forEach(function(product, index) {
        client.query('INSERT INTO design_product_master(dtm_part_no, dtm_part_name, dtm_qty, dtm_dm_id, dtm_status)VALUES ($1, $2, $3, $4,  0)',
          [product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].dm_id]);
        //client.query('update design_product_master set dtm_part_no=$1, dtm_part_name=$2, dtm_qty=$3, dtm_updated_at=now() where dtm_id=$4',[product.dtm_part_no,product.dtm_part_name,product.dtm_qty,result.rows[0].dm_id]);
        });
      
        client.query('COMMIT;');
        done();
        return res.json(results);
    });

    done(err);
  });
});

router.post('/delete/:designId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.designId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');

    var designInsert = "update design_master set dm_status=1, dm_updated_at=now() where dm_id=$1 RETURNING *",
        params = [id]
    client.query(designInsert, params, function (error, result) {
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
    const query = client.query("SELECT * from design_master order by dm_id desc limit 1");
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

router.post('/design/total', oauth.authorise(), (req, res, next) => {
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
    const strqry =  "SELECT count(dm_id) as total "+
                    "from design_master dm "+
                    "left outer join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where dm_status=0 "+
                    "and LOWER(dm_design_no||''||dm_mft_date) LIKE LOWER($1);";

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

router.post('/design/limit', oauth.authorise(), (req, res, next) => {
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
                    "FROM design_master dm "+
                    "left outer join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where dm.dm_status = 0 "+
                    "and LOWER(dm_design_no||''||dm_project_no||''||cm_name) LIKE LOWER($1) "+
                    "order by dm.dm_id desc LIMIT $2 OFFSET $3";

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
    
    const strqry =  "SELECT * "+
                    "FROM design_master dm "+
                    "left outer join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where dm.dm_status = 0 "+
                    "and LOWER(dm_design_no||''||dm_project_no) LIKE LOWER($1) "+
                    "order by dm.dm_id desc LIMIT 10";

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

router.get('/view/:designId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id=req.params.designId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * FROM design_product_master dtm inner join design_master dm on dtm.dtm_dm_id=dm.dm_id where dm_id=$1",[id]);
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