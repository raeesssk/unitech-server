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
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "from final_quotation_master fqm "+
                    "inner join quotation_master qm on fqm.fqm_qm_id=qm.qm_id "+
                    "inner join customer_master cm on fqm.fqm_cm_id=cm.cm_id "+
                    "where fqm.fqm_id = $1";

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
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "fqpm.fqpm_id, fqpm.fqpm_item, fqpm.fqpm_project_no, fqpm.fqpm_material_code, fqpm.fqpm_part, fqpm.fqpm_quantity, fqpm.fqpm_cost, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name, "+
                    "qpm.qpm_id, qpm.qpm_qty, qpm.qpm_total_cost, qpm.qpm_length, qpm.qpm_width, qpm.qpm_thickness, qpm.qpm_raw_mat_wt, qpm.qpm_rm, qpm.qpm_material_cost, qpm.qpm_sub_total, qpm.qpm_profit, qpm.qpm_cost_pc, qpm.qpm_material_code, qpm.qpm_part_name, qpm.qpm_edge_length, qpm.qpm_diameter, qpm.qpm_grinding, qpm.qpm_shape, qpm.qpm_fl_cut, qpm.qpm_turning, qpm.qpm_milling, qpm.qpm_boring, qpm.qpm_drilling, qpm.qpm_taping, qpm.qpm_cnc_mc, qpm.qpm_fabrication, qpm.qpm_hard, qpm.qpm_blacodising, qpm.qpm_punching, qpm.qpm_surf_treat, qpm.qpm_wire_cut, qpm.qpm_fl_price, qpm.qpm_fl_qty, qpm.qpm_tn_price, qpm.qpm_tn_qty, qpm.qpm_ml_price, qpm.qpm_ml_qty, qpm.qpm_gd_price, qpm.qpm_gd_qty, qpm.qpm_cnc_price, qpm.qpm_cnc_qty, qpm.qpm_wire_price, qpm.qpm_wire_qty, qpm.qpm_pr_no, qpm.qpm_item, qpm.qpm_part, qpm.qpm_fab_price, qpm.qpm_fab_qty, qpm.qpm_hard_price, qpm.qpm_hard_qty, qpm.qpm_bc_price, qpm.qpm_bc_qty, qpm.qpm_pc_price, qpm.qpm_pc_qty, qpm.qpm_surf_price, qpm.qpm_surf_qty, qpm.qpm_profit_per, qpm.qpm_sr_no, qpm.qpm_updated_at, "+
                    "mtm_name||'-'||mtm_price as mtm_search, mtm.mtm_id, mtm.mtm_name, mtm.mtm_density, mtm.mtm_price, mtm.mtm_status, mtm.mtm_created_at, mtm.mtm_updated_at "+
                    "FROM final_quotation_product_master fqpm "+
                    "inner join final_quotation_master fqm on fqpm.fqpm_fqm_id=fqm.fqm_id "+
                    "inner join quotation_product_master qpm on fqpm.fqpm_qpm_id=qpm.qpm_id "+
                    "left outer join material_master mtm on qpm.qpm_mtm_id=mtm.mtm_id "+
                    "inner join quotation_master qm on qpm.qpm_qm_id=qm.qm_id "+
                    "inner join customer_master cm on qm.qm_cm_id=cm.cm_id "+
                    "where fqm.fqm_id=$1 "+
                    "order by fqpm_id asc";

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

router.get('/edit/details/:quotationId', oauth.authorise(), (req, res, next) => {
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
    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "fqpm.fqpm_id, fqpm.fqpm_item, fqpm.fqpm_project_no, fqpm.fqpm_material_code, fqpm.fqpm_part, fqpm.fqpm_quantity, fqpm.fqpm_cost, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name, "+
                    "qpm.qpm_id, qpm.qpm_qty, qpm.qpm_total_cost, qpm.qpm_length, qpm.qpm_width, qpm.qpm_thickness, qpm.qpm_raw_mat_wt, qpm.qpm_rm, qpm.qpm_material_cost, qpm.qpm_sub_total, qpm.qpm_profit, qpm.qpm_cost_pc, qpm.qpm_material_code, qpm.qpm_part_name, qpm.qpm_edge_length, qpm.qpm_diameter, qpm.qpm_grinding, qpm.qpm_shape, qpm.qpm_fl_cut, qpm.qpm_turning, qpm.qpm_milling, qpm.qpm_boring, qpm.qpm_drilling, qpm.qpm_taping, qpm.qpm_cnc_mc, qpm.qpm_fabrication, qpm.qpm_hard, qpm.qpm_blacodising, qpm.qpm_punching, qpm.qpm_surf_treat, qpm.qpm_wire_cut, qpm.qpm_fl_price, qpm.qpm_fl_qty, qpm.qpm_tn_price, qpm.qpm_tn_qty, qpm.qpm_ml_price, qpm.qpm_ml_qty, qpm.qpm_gd_price, qpm.qpm_gd_qty, qpm.qpm_cnc_price, qpm.qpm_cnc_qty, qpm.qpm_wire_price, qpm.qpm_wire_qty, qpm.qpm_pr_no, qpm.qpm_item, qpm.qpm_part, qpm.qpm_fab_price, qpm.qpm_fab_qty, qpm.qpm_hard_price, qpm.qpm_hard_qty, qpm.qpm_bc_price, qpm.qpm_bc_qty, qpm.qpm_pc_price, qpm.qpm_pc_qty, qpm.qpm_surf_price, qpm.qpm_surf_qty, qpm.qpm_profit_per, qpm.qpm_sr_no, qpm.qpm_updated_at, "+
                    "mtm_name||'-'||mtm_price as mtm_search, mtm.mtm_id, mtm.mtm_name, mtm.mtm_density, mtm.mtm_price, mtm.mtm_status, mtm.mtm_created_at, mtm.mtm_updated_at "+
                    "from quotation_product_master qpm "+
                    "inner join material_master mtm on qpm.qpm_mtm_id=mtm.mtm_id "+
                    "inner join quotation_master qm on qpm.qpm_qm_id=qm.qm_id "+
                    "inner join final_quotation_master fqm on fqm.fqm_qm_id=qm.qm_id "+
                    "left outer join final_quotation_product_master fqpm on fqpm.fqpm_qpm_id = qpm.qpm_id "+
                    "inner join customer_master cm on qm.qm_cm_id=cm.cm_id "+
                    "where fqm.fqm_id=$1 "+
                    "order by qpm_id asc";

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
  const finalquotation=req.body.finalquotation;
  const purchaseMultipleData=req.body.purchaseMultipleData;

  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');

    var singleInsert = 'INSERT INTO final_quotation_master(fqm_qm_id, fqm_no, fqm_date, fqm_po_no, fqm_po_date, fqm_dispatch_date, fqm_amount, fqm_quantity, fqm_cm_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
        params = [finalquotation.fqm_qm_id.qm_id,finalquotation.fqm_no,finalquotation.fqm_date,finalquotation.fqm_po_no,finalquotation.fqm_po_date, finalquotation.fqm_dispatch_date,finalquotation.fqm_amount, finalquotation.fqm_quantity,finalquotation.fqm_qm_id.cm_id];
    client.query(singleInsert, params, function (error, result) {
      
        results.push(result.rows[0]); // Will contain your inserted rows

        purchaseMultipleData.forEach(function(product, index) {

          var singleInsertPro = 'INSERT INTO final_quotation_product_master(fqpm_qpm_id, fqpm_fqm_id, fqpm_item, fqpm_project_no, fqpm_material_code, fqpm_part, fqpm_quantity, fqpm_cost) values($1,$2,$3,$4,$5,$6,$7,$8)',
          paramsPro = [product.qpm_id,result.rows[0].fqm_id,product.fqpm_item,product.qpm_pr_no,product.qpm_material_code,product.qpm_part,product.fqpm_quantity, product.qpm_cost_pc];

          client.query(singleInsertPro, paramsPro);
          
        
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
  const finalquotation=req.body.finalquotation;
  const purchaseMultipleData=req.body.purchaseMultipleData;

  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    
    var singleInsert = 'update final_quotation_master set  fqm_date=$1, fqm_po_no=$2, fqm_po_date=$3, fqm_dispatch_date=$4, fqm_amount=$5, fqm_quantity=$6, fqm_cm_id=$7, fqm_updated_at=now() where fqm_id=$8 RETURNING *',
        params = [finalquotation.fqm_date, finalquotation.fqm_po_no, finalquotation.fqm_po_date, finalquotation.fqm_dispatch_date,finalquotation.fqm_amount,finalquotation.fqm_quantity,finalquotation.cm_id, id];
    client.query(singleInsert, params, function (error, result) {
        results.push(result.rows[0]); // Will contain your inserted rows

            client.query("delete from final_quotation_product_master where fqpm_fqm_id = $1",
                  [id]);

        purchaseMultipleData.forEach(function(product, index) {

          var singleInsertPro = 'INSERT INTO final_quotation_product_master(fqpm_qpm_id, fqpm_fqm_id, fqpm_item, fqpm_project_no, fqpm_material_code, fqpm_part, fqpm_quantity, fqpm_cost) values($1,$2,$3,$4,$5,$6,$7,$8)',
          paramsPro = [product.qpm_id,id,product.fqpm_item,product.qpm_pr_no,product.qpm_material_code,product.qpm_part,product.qty, product.qpm_cost_pc];

          client.query(singleInsertPro, paramsPro);
          
        
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

    var singleInsert = "update final_quotation_master set fqm_status=1, fqm_updated_at=now() where fqm_id=$1 RETURNING *",
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
    const query = client.query("SELECT * from final_quotation_master order by fqm_id desc limit 1");
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

router.post('/finalquotation/total', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const str = "%"+req.body.search+"%";

    const strqry =  "SELECT count(fqm_id) as total "+
                    "from final_quotation_master fqm "+
                    "inner join quotation_master qm on fqm.fqm_qm_id=qm.qm_id "+
                    "inner join customer_master cm on fqm.fqm_cm_id=cm.cm_id "+
                    "where LOWER(qm_quotation_no||''||fqm_no||''||fqm_po_no) LIKE LOWER($1);";

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

router.post('/finalquotation/limit', oauth.authorise(), (req, res, next) => {
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

    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "from final_quotation_master fqm "+
                    "inner join quotation_master qm on fqm.fqm_qm_id=qm.qm_id "+
                    "inner join customer_master cm on fqm.fqm_cm_id=cm.cm_id "+
                    "where LOWER(qm_quotation_no||''||fqm_no||''||fqm_po_no) LIKE LOWER($1) "+
                    "order by fqm.fqm_id desc LIMIT $2 OFFSET $3";

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

    const strqry =  "select qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "cm_name||'-'||cm_address||'-'||cm_mobile as cm_search, cm.cm_id, cm.cm_name, cm.cm_mobile, cm.cm_address, cm.cm_state, cm.cm_city, cm.cm_pin_code, cm.cm_credit, cm.cm_debit, cm.cm_email, cm.cm_gst, cm.cm_opening_credit, cm.cm_opening_debit, cm.cm_status, cm.cm_created_at, cm.cm_updated_at, cm.cm_contact_person_name, cm.cm_contact_person_number, cm.cm_dept_name "+
                    "from final_quotation_master fqm "+
                    "inner join quotation_master qm on fqm.fqm_qm_id=qm.qm_id "+
                    "inner join customer_master cm on fqm.fqm_cm_id=cm.cm_id "+
                    "where LOWER(qm_quotation_no||''||fqm_no||''||fqm_po_no) LIKE LOWER($1) "+
                    "order by fqm.fqm_id desc LIMIT 10";

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