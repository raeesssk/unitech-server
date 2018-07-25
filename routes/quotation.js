var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);



router.post('/add', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    var singleInsert = 'INSERT INTO quatation_master(qm_design_no, qm_quotation_no, qm_cm_id, qm_date, qm_ref_no, qm_status) values($1,$2,$3,$4,$5,0) RETURNING *',
        params = [req.body.qm_design_no.dm_design_no,req.body.qm_quotation_no,req.body.qm_cm_id.cm_id,req.body.qm_date,req.body.qm_ref_no];
    client.query(singleInsert, params, function (error, result) {
      
        results.push(result.rows[0]); // Will contain your inserted rows
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
    const query = client.query('SELECT qm_design_no,qm_quotation_no,qm_cm_id,qm_date,qm_ref_no,cm_name FROM quatation_master qm inner join customer_master cm on qm.qm_cm_id=cm.cm_id where qm_id=$1',[id]);
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
  console.log(req.body.qm_design_no);
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
    const strqry =  "SELECT count(dm_id) as total "+
                    "from design_master "+
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
                    "and LOWER(qm_design_no||''||qm_cm_id) LIKE LOWER($1) "+
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



module.exports = router;