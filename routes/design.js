var express = require('express');
var router = express.Router();
var oauth = require('../oauth/index');
var pg = require('pg');
var path = require('path');
const cmd = require('node-cmd');
var config = require('../config.js');

var multer = require('multer'); 

var filenamestore = "";

var pool = new pg.Pool(config);



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
    const strqry =  "select dm.dm_id, dm.dm_design_no, dm.dm_project_no, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, dm.dm_date, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM design_master dm "+
                    "inner join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where dm.dm_id=$1";
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

router.get('/details/:designId', oauth.authorise(), (req, res, next) => {
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
    const strqry =  "select dm.dm_id, dm.dm_design_no, dm.dm_project_no, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, dm.dm_date, "+
                    "mtm_name||'-'||mtm_price as mtm_search, mtm.mtm_id, mtm.mtm_name, mtm.mtm_density, mtm.mtm_price, mtm.mtm_status, mtm.mtm_created_at, mtm.mtm_updated_at, "+
                    "dtm.dtm_id, dtm.dtm_qty, dtm.dtm_image, dtm.dtm_material_cost, dtm.dtm_length, dtm.dtm_width, dtm.dtm_thickness, dtm.dtm_raw_mat_wt, dtm.dtm_rm, dtm.dtm_material_code, dtm.dtm_part_name, dtm.dtm_edge_length, dtm.dtm_diameter, dtm.dtm_shape "+
                    "FROM design_product_master dtm "+
                    "inner join design_master dm on dtm.dtm_dm_id=dm.dm_id "+
                    "inner join material_master mtm on dtm.dtm_mtm_id=mtm.mtm_id "+
                    "where dtm.dtm_dm_id=$1";
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

// router.get('/details/images/:designId', oauth.authorise(), (req, res, next) => {
//   const results = [];
//   const id = req.params.designId;
//   pool.connect(function(err, client, done){
//     if(err) {
//       done();
//       // pg.end();
//       console.log("the error is"+err);
//       return res.status(500).json({success: false, data: err});
//     }
//     // SQL Query > Select Data
//     const strqry =  "select dm.dm_id, dm.dm_design_no, dm.dm_project_no, dm.dm_status, dm.dm_created_at, dm.dm_updated_at, "+
//                     "dim.dim_id, dim.dim_image "+
//                     "FROM design_image_master dim "+
//                     "inner join design_master dm on dim.dim_dm_id=dm.dm_id "+
//                     "where dim.dim_dm_id=$1";
//     const query = client.query(strqry,[id]);
//     query.on('row', (row) => {
//       results.push(row);
//     });
//     query.on('end', () => {
//       done();
//       // pg.end();
//       return res.json(results);
//     });
//   done(err);
//   });
// });

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

    client.query('BEGIN;');

    var designInsert = 'INSERT INTO public.design_master( dm_design_no, dm_cm_id, dm_project_no,  dm_date, dm_status)VALUES ($1, $2, $3, $4, 0) RETURNING *',
        params = [purchasedesignData.dm_design_no,purchasedesignData.dm_cm_id.cm_id,purchasedesignData.dm_project_no,purchasedesignData.dm_date]
    client.query(designInsert, params, function (error, result) {
        results.push(result.rows[0]) // Will contain your inserted rows

      purchaseMultipleData.forEach(function(product, index) {
        client.query('INSERT INTO design_product_master(dtm_qty, dtm_dm_id, dtm_mtm_id, dtm_material_cost, dtm_length, dtm_width, dtm_thickness, dtm_raw_mat_wt, dtm_rm, dtm_material_code, dtm_part_name, dtm_edge_length, dtm_diameter, dtm_shape)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
          [product.dtm_qty,result.rows[0].dm_id, product.mtm_id.mtm_id, product.dtm_material_cost, product.dtm_length, product.dtm_width, product.dtm_thickness, product.dtm_raw_mat_wt, product.dtm_rm, product.dtm_material_code, product.dtm_part_name, product.dtm_edge_length, product.dtm_diameter, product.dtm_shape]);
      });

      client.query('COMMIT;');
      done();
      return res.json(results);
    });
  done(err);
  });
});

router.post('/image/add', oauth.authorise(), (req, res, next) => {
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

  var upload = multer({ storage: Storage }).array("dm_image"); 

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

      var singleInsert = 'INSERT INTO design_product_master(dtm_im_id, dtm_qty, dtm_dm_id, dtm_image) VALUES ($1, $2, $3, $4) RETURNING *',
          params = [req.body.dtm_im_id,req.body.dtm_qty,req.body.dim_dm_id, filenamestore]
      // var singleInsert = 'INSERT INTO design_image_master(dim_dm_id,dim_image) values($1,$2) RETURNING *',
      //     params = [req.body.dim_dm_id, filenamestore]
      client.query(singleInsert, params, function (error, result) {
          results.push(result.rows[0]); // Will contain your inserted rows
          done();
          return res.json(results);
      });
      done(err);
    });
  }); 
});

router.post('/edit/:designId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.designId;
  const design=req.body.design;
  const oldDetails=req.body.materialDetails;
  const removeDetails=req.body.materialRemoveDetails;
  const purchaseMultipleData=req.body.materialNewDetails;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    var designInsert = 'update public.design_master set  dm_cm_id=$1, dm_project_no=$2, dm_date=$3, dm_updated_at=now() where dm_id=$4 RETURNING *',
        params = [design.dm_cm.cm_id,design.dm_project_no,design.dm_date,id];
    client.query(designInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows
        
        removeDetails.forEach(function(product, index) {

          const fin = product.dtm_image;
          if(fin != null)
          {
            const finyr = fin.split('/');
            const finyr2 = finyr[2];
            cmd.run('rm /usr/share/nginx/html/images/'+finyr2);
          }
          
          client.query('delete from public.design_product_master where dtm_id=$1',[product.dtm_id]);
        });

        oldDetails.forEach(function(product, index) {
          client.query('update design_product_master set dtm_qty=$1, dtm_material_cost=$2, dtm_length=$3, dtm_width=$4, dtm_thickness=$5, dtm_diameter=$6, dtm_edge_length=$7, dtm_raw_mat_wt=$8, dtm_rm=$9 where dtm_id=$10',
            [product.dtm_qty, product.dtm_material_cost, product.dtm_length, product.dtm_width, product.dtm_thickness, product.dtm_diameter, product.dtm_edge_length, product.dtm_raw_mat_wt, product.dtm_rm,product.dtm_id]);
        });

        purchaseMultipleData.forEach(function(product, index) {
        client.query('INSERT INTO design_product_master(dtm_qty, dtm_dm_id, dtm_mtm_id, dtm_material_cost, dtm_length, dtm_width, dtm_thickness, dtm_raw_mat_wt, dtm_rm, dtm_material_code, dtm_part_name, dtm_edge_length, dtm_diameter, dtm_shape)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
          [product.dtm_qty,id, product.mtm_id.mtm_id, product.dtm_material_cost, product.dtm_length, product.dtm_width, product.dtm_thickness, product.dtm_raw_mat_wt, product.dtm_rm, product.dtm_material_code, product.dtm_part_name, product.dtm_edge_length, product.dtm_diameter, product.dtm_shape]);
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
                    "where LOWER(dm_design_no||''||dm_project_no||''||cm_name) LIKE LOWER($1);";

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

    const strqry =  "select dm.dm_id, dm.dm_design_no, dm.dm_project_no, dm.dm_status, dm.dm_created_at, dm.dm_updated_at,  dm.dm_date, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM design_master dm "+
                    "left outer join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where LOWER(dm_design_no||''||dm_project_no||''||cm_name) LIKE LOWER($1) "+
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
    
    const strqry =  "select dm.dm_id, dm.dm_design_no, dm.dm_project_no, dm.dm_status, dm.dm_created_at, dm.dm_updated_at,  dm.dm_date, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "FROM design_master dm "+
                    "join customer_master cm on dm.dm_cm_id=cm.cm_id "+
                    "where dm.dm_status = 0 "+
                    "and LOWER(dm_project_no) LIKE LOWER($1) "+
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