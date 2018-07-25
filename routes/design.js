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

    var singleInsert = 'INSERT INTO design_master(dm_design_no, dm_cm_id, dm_mft_date, dm_dely_date, dm_project_no, dm_po_no, dm_po_date,  dm_status) values($1,$2,$3,$4,$5,$6,$7,0) RETURNING *',
        params = [req.body.dm_design_no,req.body.dm_cm_id,req.body.dm_mft_date,req.body.dm_dely_date,req.body.dm_project_no,req.body.dm_po_no,req.body.dm_po_date];
    client.query(singleInsert, params, function (error, result) {
      
        results.push(result.rows[0]); // Will contain your inserted rows
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
    const query = client.query('SELECT dm_design_no,dm_cm_id,dm_mft_date,dm_dely_date,dm_project_no,dm_po_no,dm_po_date,cm_name FROM design_master dm inner join customer_master cm on dm.dm_cm_id=cm.cm_id where dm_id=$1',[id]);
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
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    var singleInsert = 'update design_master set dm_design_no=$1, dm_cm_id=$2, dm_mft_date=$3, dm_dely_date=$4, dm_project_no=$5, dm_po_no=$6, dm_po_date=$7, dm_updated_at=now() where dm_id=$8 RETURNING *',
        params = [req.body.dm_design_no,req.body.dm_cm_id,req.body.dm_mft_date,req.body.dm_dely_date,req.body.dm_project_no,req.body.dm_po_no,req.body.dm_po_date,id];
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        
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

    var singleInsert = "update design_master set dm_status=1, dm_updated_at=now() where dm_id=$1 RETURNING *",
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
                    "and LOWER(dm_design_no||''||dm_mft_date) LIKE LOWER($1) "+
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


module.exports = router;