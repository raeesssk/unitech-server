var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
var config = require('../config.js');

var pool = new pg.Pool(config);


router.get('/view/:rmId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id=req.params.rmId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * FROM role_permission_master rpm inner join permission_master pm on rpm.rpm_pm_id=pm.pm_id left outer join role_master rm on rpm.rpm_rm_id=rm.rm_id where rm_id=$1",[id]);
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