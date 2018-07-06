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
    const query = client.query("SELECT *,COALESCE(im_vehical_no, '') as im_vehical_no FROM invoice_master im LEFT OUTER JOIN customer_master cm on im.im_cm_id = cm.cm_id order by im_id desc");
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

router.get('/:smId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.smId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query("SELECT *,COALESCE(im_vehical_no, '') as im_vehical_no FROM invoice_master im LEFT OUTER JOIN customer_master cm on im.im_cm_id = cm.cm_id where im_id=$1",[id]);
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

router.get('/details/:smId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.smId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM invoice_product_master ipm LEFT OUTER JOIN invoice_master im on ipm.ipm_im_id = im.im_id LEFT OUTER JOIN product_master pm on ipm.ipm_pm_id = pm.pm_id where ipm.ipm_im_id=$1',[id]);
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
  const purchaseSingleData = req.body.purchaseSingleData;
  const purchaseMultipleData = req.body.purchaseMultipleData;
  
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
      client.query('BEGIN;');

      const credit = purchaseSingleData.im_cm_id.cm_balance;
      const amount = purchaseSingleData.totalamount;
      if(credit > amount)
      {
        client.query('update customer_master set cm_balance=cm_balance-$1 where cm_id=$2',[amount,purchaseSingleData.im_cm_id.cm_id]);
      }
      else
      {
        const debit = amount - credit;
        client.query('update customer_master set cm_balance=cm_balance-$1, cm_debit=cm_debit+$2 where cm_id=$3',[credit,debit,purchaseSingleData.im_cm_id.cm_id]);
      }

      var singleInsert = 'INSERT INTO invoice_master(im_invoice_no, im_date, im_cm_id, im_net_amount, im_cgst_amount, im_sgst_amount, im_total_amount, im_vehical_no, im_status) values($1,$2,$3,$4,$5,$6,$7,$8,0) RETURNING *',
        params = [purchaseSingleData.im_invoice_no,purchaseSingleData.im_date,purchaseSingleData.im_cm_id.cm_id,purchaseSingleData.amount,purchaseSingleData.vat,purchaseSingleData.sgst,purchaseSingleData.totalamount,purchaseSingleData.im_vehical_no]
      client.query(singleInsert, params, function (error, result) {
          results.push(result.rows[0]); // Will contain your inserted rows

          purchaseMultipleData.forEach(function(product, index) {
            client.query('INSERT INTO public.invoice_product_master(ipm_im_id, ipm_pm_id, ipm_quantity, ipm_rate, ipm_cgst, ipm_sgst)VALUES ($1, $2, $3, $4, $5, $6)',[result.rows[0].im_id,product.pm_id.pm_id,product.pm_qty,product.price,product.pm_id.pm_cgst,product.pm_id.pm_sgst]);
          });
      client.query('COMMIT;');
          done();
          return res.json(results);
      });
    done(err);
  });

});

router.post('/edit/:smId', oauth.authorise(), (req, res, next) => {
  const id = req.params.smId;
  const results = [];
  const purchaseSingleData = req.body.purchaseSingleData;
  const purchaseMultipleData = req.body.purchaseMultipleData;
  const purchaseadd = req.body.purchaseadd;
  const purchaseremove = req.body.purchaseremove;
  
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
      client.query('BEGIN;');


      const debit = purchaseSingleData.old_im_cm_id.cm_debit;
      const amount = purchaseSingleData.old_im_total_amount;
      if(debit > amount)
      {
        client.query('update customer_master set cm_debit=cm_debit-$1 where cm_id=$2',[amount,purchaseSingleData.old_im_cm_id.cm_id]);
      }
      else
      {
        const credit = amount - debit;
        client.query('update customer_master set cm_balance=cm_balance+$1, cm_debit=cm_debit-$2 where cm_id=$3',[credit,debit,purchaseSingleData.old_im_cm_id.cm_id]);
      }


      const query = client.query('SELECT * FROM customer_master where cm_id = $1',[purchaseSingleData.im_cm.cm_id]);
      query.on('row', (row) => {
        const credit = row.cm_balance;
        const amount = purchaseSingleData.totalamount;
        if(credit > amount)
        {
          client.query('update customer_master set cm_balance=cm_balance-$1 where cm_id=$2',[amount,purchaseSingleData.im_cm.cm_id]);
        }
        else
        {
          const debit = amount - credit;
          client.query('update customer_master set cm_balance=cm_balance-$1, cm_debit=cm_debit+$2 where cm_id=$3',[credit,debit,purchaseSingleData.im_cm.cm_id]);
        }
      });
      query.on('end', () => {
        done();
      });


      var singleInsert = 'update invoice_master set im_date=$1, im_cm_id=$2, im_vehical_no=$3, im_net_amount=$4, im_cgst_amount=$5, im_sgst_amount=$6, im_total_amount=$7, im_updated_at = now() where im_id=$8 RETURNING *',
        params = [purchaseSingleData.im_date,purchaseSingleData.im_cm.cm_id,purchaseSingleData.im_vehical_no,purchaseSingleData.amount,purchaseSingleData.vat,purchaseSingleData.sgst,purchaseSingleData.totalamount,id]
      client.query(singleInsert, params, function (error, result) {
          results.push(result.rows[0]); // Will contain your inserted rows

          purchaseremove.forEach(function(product, index) {
            client.query('delete from public.invoice_product_master where ipm_id=$1',[product.ipm_id]);
          });

          purchaseMultipleData.forEach(function(product, index) {
            client.query('update public.invoice_product_master set ipm_quantity=$1, ipm_rate=$2 where ipm_id=$3',[product.ipm_quantity,product.ipm_rate,product.ipm_id]);
          });

          purchaseadd.forEach(function(product, index) {
            client.query('INSERT INTO public.invoice_product_master(ipm_im_id, ipm_pm_id, ipm_quantity, ipm_rate, ipm_cgst, ipm_sgst)VALUES ($1, $2, $3, $4, $5, $6)',[id,product.pm_id.pm_id,product.pm_qty,product.price,product.pm_id.pm_cgst,product.pm_id.pm_sgst]);
          });
      client.query('COMMIT;');
          done();
          return res.json(results);
      });
    done(err);
  });

});

router.post('/delete/:smId', oauth.authorise(), (req, res, next) => {
  const results = [];
  const id = req.params.smId;
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    client.query('BEGIN;');

    const debit = req.body.cm_debit;
    const amount = req.body.im_total_amount;
    if(debit > amount)
    {
      client.query('update customer_master set cm_debit=cm_debit-$1 where cm_id=$2',[amount,req.body.cm_id]);
    }
    else
    {
      const credit = amount - debit;
      client.query('update customer_master set cm_balance=cm_balance+$1, cm_debit=cm_debit-$2 where cm_id=$3',[credit,debit,req.body.cm_id]);
    }
    
    client.query('UPDATE invoice_master SET im_status=1 WHERE im_id=($1)', [id]);

    client.query('COMMIT;');
      done();
    return res.end("Successfully.");
    done(err);
  });
});

router.get('/serial/no', oauth.authorise(), (req, res, next) => {
  const results = [];
  pool.connect(function(err, client, done){
    if(err) {
      done();
      // pg.end();
      console.log("the error is"+err);
      return res.status(500).json({success: false, data: err});
    }
    const query = client.query("SELECT * from invoice_master order by im_id desc limit 1;");
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
