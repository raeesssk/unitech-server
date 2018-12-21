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
    const strqry =  "select pom_id, pom_no, pom_date, pom_expected_date, pom_amount, pom_created_at, pom_updated_at, pom_status, pom_quantity, "+
                    "qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "sm_name||'-'||sm_address||'-'||sm_mobile as sm_search, sm.sm_id, sm.sm_name, sm.sm_gst_no, sm.sm_address, sm.sm_state, sm.sm_city, sm.sm_pin, sm.sm_mobile, sm.sm_email, sm.sm_debit, sm.sm_opening_debit, sm.sm_credit, sm.sm_opening_credit, sm.sm_contact_person_name, sm.sm_contact_person_number, sm.sm_status, sm.sm_created_at, sm.sm_updated_at "+
                    "from purchaseorder_master pom "+
                    "inner join final_quotation_master fqm on pom.pom_fqm_id = fqm.fqm_id "+
                    "inner join quotation_master qm on fqm.fqm_qm_id=qm.qm_id "+
                    "inner join supplier_master sm on pom.pom_sm_id=sm.sm_id "+
                    "where pom.pom_id = $1";

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
    const strqry =  "select popm_id, popm_shape, popm_cost, popm_quantity, popm_weight, "+
                    "pom_id, pom_no, pom_date, pom_expected_date, pom_amount, pom_created_at, pom_updated_at, pom_status, pom_quantity, "+
                    "qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "fqpm.fqpm_id, fqpm.fqpm_item, fqpm.fqpm_project_no, fqpm.fqpm_material_code, fqpm.fqpm_part, fqpm.fqpm_quantity, fqpm.fqpm_cost, "+
                    "sm_name||'-'||sm_address||'-'||sm_mobile as sm_search, sm.sm_id, sm.sm_name, sm.sm_gst_no, sm.sm_address, sm.sm_state, sm.sm_city, sm.sm_pin, sm.sm_mobile, sm.sm_email, sm.sm_debit, sm.sm_opening_debit, sm.sm_credit, sm.sm_opening_credit, sm.sm_contact_person_name, sm.sm_contact_person_number, sm.sm_status, sm.sm_created_at, sm.sm_updated_at, "+
                    "qpm.qpm_id, qpm.qpm_qty, qpm.qpm_total_cost, qpm.qpm_length, qpm.qpm_width, qpm.qpm_thickness, qpm.qpm_raw_mat_wt, qpm.qpm_rm, qpm.qpm_material_cost, qpm.qpm_sub_total, qpm.qpm_profit, qpm.qpm_cost_pc, qpm.qpm_material_code, qpm.qpm_part_name, qpm.qpm_edge_length, qpm.qpm_diameter, qpm.qpm_grinding, qpm.qpm_shape, qpm.qpm_fl_cut, qpm.qpm_turning, qpm.qpm_milling, qpm.qpm_boring, qpm.qpm_drilling, qpm.qpm_taping, qpm.qpm_cnc_mc, qpm.qpm_fabrication, qpm.qpm_hard, qpm.qpm_blacodising, qpm.qpm_punching, qpm.qpm_surf_treat, qpm.qpm_wire_cut, qpm.qpm_fl_price, qpm.qpm_fl_qty, qpm.qpm_tn_price, qpm.qpm_tn_qty, qpm.qpm_ml_price, qpm.qpm_ml_qty, qpm.qpm_gd_price, qpm.qpm_gd_qty, qpm.qpm_cnc_price, qpm.qpm_cnc_qty, qpm.qpm_wire_price, qpm.qpm_wire_qty, qpm.qpm_pr_no, qpm.qpm_item, qpm.qpm_part, qpm.qpm_fab_price, qpm.qpm_fab_qty, qpm.qpm_hard_price, qpm.qpm_hard_qty, qpm.qpm_bc_price, qpm.qpm_bc_qty, qpm.qpm_pc_price, qpm.qpm_pc_qty, qpm.qpm_surf_price, qpm.qpm_surf_qty, qpm.qpm_profit_per, qpm.qpm_sr_no, qpm.qpm_updated_at, "+
                    "mtm_name||'-'||mtm_price as mtm_search, mtm.mtm_id, mtm.mtm_name, mtm.mtm_density, mtm.mtm_price, mtm.mtm_status, mtm.mtm_created_at, mtm.mtm_updated_at "+
                    "FROM purchaseorder_product_master popm "+
                    "inner join purchaseorder_master pom on popm.popm_pom_id=pom.pom_id "+
                    "inner join final_quotation_product_master fqpm on popm.popm_fqpm_id=fqpm.fqpm_id "+
                    "inner join final_quotation_master fqm on fqpm.fqpm_fqm_id=fqm.fqm_id "+
                    "inner join quotation_product_master qpm on fqpm.fqpm_qpm_id=qpm.qpm_id "+
                    "inner join material_master mtm on popm.popm_mtm_id=mtm.mtm_id "+
                    "inner join quotation_master qm on qpm.qpm_qm_id=qm.qm_id "+
                    "inner join supplier_master sm on pom.pom_sm_id=sm.sm_id "+
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
  const purchaseorder=req.body.purchaseorder;
  const purchaseMultipleData=req.body.purchaseMultipleData;

  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }

    client.query('BEGIN;');

    var singleInsert = 'INSERT INTO purchaseorder_master(pom_fqm_id, pom_no, pom_date, pom_expected_date, pom_sm_id, pom_amount, pom_quantity) values($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        params = [purchaseorder.pom_fqm_id.fqm_id,purchaseorder.pom_no,purchaseorder.pom_date,purchaseorder.pom_expected_date,purchaseorder.pom_sm_id.sm_id, purchaseorder.pom_amount,purchaseorder.pom_quantity];
    client.query(singleInsert, params, function (error, result) {
      
        results.push(result.rows[0]); // Will contain your inserted rows

        purchaseMultipleData.forEach(function(product, index) {

          var singleInsertPro = 'INSERT INTO purchaseorder_product_master(popm_mtm_id, popm_pom_id, popm_shape, popm_cost, popm_quantity, popm_weight, popm_fqpm_id) values($1,$2,$3,$4,$5,$6,$7)',
          paramsPro = [product.mtm_id,result.rows[0].pom_id,product.qpm_shape,product.popm_cost,product.popm_quantity,product.popm_weight,product.fqpm_id];

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
  const purchaseorder=req.body.purchaseorder;
  const purchaseMultipleData=req.body.purchaseMultipleData;

  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');
    
    
    var singleInsert = 'update purchaseorder_master set  pom_date=$1, pom_expected_date=$2, pom_amount=$3, pom_quantity=$4, pom_sm_id=$5, pom_updated_at=now() where pom_id=$6 RETURNING *',
        params = [finalquotation.pom_date, finalquotation.pom_expected_date, finalquotation.pom_amount, finalquotation.pom_quantity,finalquotation.pom_sm.sm_id, id];
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

    var singleInsert = "update purchaseorder_master set pom_status=1, pom_updated_at=now() where pom_id=$1 RETURNING *",
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
    const query = client.query("SELECT * from purchaseorder_master order by pom_id desc limit 1");
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

router.post('/purchaseorder/total', oauth.authorise(), (req, res, next) => {
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
                    "from purchaseorder_master pom "+
                    "inner join final_quotation_master fqm on pom.pom_fqm_id = fqm.fqm_id "+
                    "inner join quotation_master qm on fqm.fqm_qm_id=qm.qm_id "+
                    "inner join supplier_master sm on pom.pom_sm_id=sm.sm_id "+
                    "where LOWER(pom_no||''||fqm_no) LIKE LOWER($1);";

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

router.post('/purchaseorder/limit', oauth.authorise(), (req, res, next) => {
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

    const strqry =  "select pom_id, pom_no, pom_date, pom_expected_date, pom_amount, pom_created_at, pom_updated_at, pom_status, pom_quantity, "+
                    "qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "sm_name||'-'||sm_address||'-'||sm_mobile as sm_search, sm.sm_id, sm.sm_name, sm.sm_gst_no, sm.sm_address, sm.sm_state, sm.sm_city, sm.sm_pin, sm.sm_mobile, sm.sm_email, sm.sm_debit, sm.sm_opening_debit, sm.sm_credit, sm.sm_opening_credit, sm.sm_contact_person_name, sm.sm_contact_person_number, sm.sm_status, sm.sm_created_at, sm.sm_updated_at "+
                    "from purchaseorder_master pom "+
                    "inner join final_quotation_master fqm on pom.pom_fqm_id = fqm.fqm_id "+
                    "inner join quotation_master qm on fqm.fqm_qm_id=qm.qm_id "+
                    "inner join supplier_master sm on pom.pom_sm_id=sm.sm_id "+
                    "where LOWER(pom_no||''||fqm_no) LIKE LOWER($1) "+
                    "order by pom.pom_id desc LIMIT $2 OFFSET $3";

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

    const strqry =  "select pom_id, pom_no, pom_date, pom_expected_date, pom_amount, pom_created_at, pom_updated_at, pom_status, pom_quantity, "+
                    "qm.qm_id, qm.qm_quotation_no, qm.qm_date, qm.qm_total_cost, qm.qm_net_cost, qm.qm_cgst_per, qm.qm_cgst_amount, qm.qm_sgst_per, qm.qm_sgst_amount, qm.qm_igst_per, qm.qm_igst_amount, qm.qm_transport, qm.qm_other_charges, qm.qm_discount, qm.qm_ref, qm.qm_comment, qm.qm_status, qm.qm_approve, qm.qm_created_at, qm.qm_updated_at, qm.qm_attend_by, qm.qm_date_of_email, "+
                    "fqm.fqm_id, fqm.fqm_no, fqm.fqm_date, fqm.fqm_po_no, fqm.fqm_po_date, fqm.fqm_dispatch_date, fqm.fqm_amount, fqm.fqm_created_at, fqm.fqm_updated_at, fqm.fqm_status, fqm.fqm_quantity, "+
                    "sm_name||'-'||sm_address||'-'||sm_mobile as sm_search, sm.sm_id, sm.sm_name, sm.sm_gst_no, sm.sm_address, sm.sm_state, sm.sm_city, sm.sm_pin, sm.sm_mobile, sm.sm_email, sm.sm_debit, sm.sm_opening_debit, sm.sm_credit, sm.sm_opening_credit, sm.sm_contact_person_name, sm.sm_contact_person_number, sm.sm_status, sm.sm_created_at, sm.sm_updated_at "+
                    "from purchaseorder_master pom "+
                    "inner join final_quotation_master fqm on pom.pom_fqm_id = fqm.fqm_id "+
                    "inner join quotation_master qm on fqm.fqm_qm_id=qm.qm_id "+
                    "inner join supplier_master sm on pom.pom_sm_id=sm.sm_id "+
                    "where LOWER(pom_no||''||fqm_no) LIKE LOWER($1) "+
                    "order by pom.pom_id desc LIMIT 10";

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