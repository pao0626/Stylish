const express = require("express");
const multer = require("multer");
const _ = require('lodash');
const router = express.Router();
const stylish = require("../services/stylish");
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const {TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID, TOKEN_SECRET} = process.env;
// image store path & name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

/* GET productlist */
router.get("/products/:category", async function (req, res, next) {
  const category = req.params.category;
  const paging = parseInt(req.query.paging) || 0;
  const {products} = await stylish.getProductlist(paging, category);
  if (!products) {
    res.status(400).send({error:'Wrong Request'});
    return;
  }
  let productsWithDetail = await getProductsWithDetail(products);
  const result = {data: productsWithDetail};
  res.status(200).json(result);
});

const getProductsWithDetail = async (products) => {
  const productIds = products.map(p => p.id);
  const variants = await stylish.getProductsStock(productIds);
  const variantsMap = _.groupBy(variants, v => v.product_id);

  return products.map((p) => {
    const productVariants = variantsMap[p.id];
    if (!productVariants) { return p; }

    p.variants = productVariants.map(v => ({
        color_code: v.color,
        size: v.size,
        stock: v.stock,
    }));

    const allColors = productVariants.map(v => v.color);
    p.colors = _.uniq(allColors);

    const allSizes = productVariants.map(v => v.size);
    p.sizes = _.uniq(allSizes);
    return p;
  });
};

/* GET search */
router.get("/search", async function (req, res, next) {
  try {
    //query parameter
    res.json(await stylish.getSearch(req.query.page, req.query.keyword));
  } catch (err) {
    console.error(`Error while searching product `, err.message);
    next(err);
  }
});

/* GET Productdetail */
router.get("/details", async function (req, res, next) {
  const id = parseInt(req.query.id);
  if (Number.isInteger(id)) {
    const {detail} = await stylish.getProductDetail(id);
    if (!detail) {
      res.status(400).send({error:'Wrong Request'});
      return;
    }
    let productsWithDetail = await getProductsWithDetail(detail);
    productsWithDetail = productsWithDetail[0];
    const result = {data: productsWithDetail};
    res.status(200).json(result);
  }
});

/* POST product */
const cpUpload = upload.fields([
  { name: "image", maxCount: 1 },
  // { name: "detail_image", maxCount: 8 },
]);
router.post("/newproduct", cpUpload, async function (req, res, next) {
  try {
    res.json(
      await stylish.create(
        req.body,
        req.files["image"][0]
        // req.files["detail_image"]
      )
    );
  } catch (err) {
    console.error(`Error while creating new product`, err.message);
    next(err);
  }
});

/* POST user signup */
router.post("/signup", async function (req, res, next) {
  const {name, email, password} = req.body;

  if(!name || !email || !password) {
    res.status(400).send({error:'Request Error: name, email and password are required.'});
    return;
  }

  const result = await stylish.signup(name, email, password);
  if (result.error) {
    res.status(403).send({error: result.error.message});
    return;
  }

  const user  = result.user;
  if (!user) {
    res.status(500).send({error: 'Database Query Error'});
    return;
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      user: {
        name: user.name,
        email: user.email,
      }
    }
  });
});

/* POST user signin */
router.post("/signin", async function (req, res, next) {
  const {email, password} = req.body;

  if(!email || !password){
    res.status(400).send({error:'Request Error: email and password are required.'});
    return;
  }
  
  const result = await stylish.signin(email, password);

  if (result.error) {
    const status_code = result.status ? result.status : 403;
    res.status(status_code).send({error: result.error.message});
    next(result.error);
    return;
  }

  const user = result.user;
  if (!user) {
    res.status(500).send({error: 'Database Query Error'});
    return;
  }

  res.status(200).send({
    data: {
      access_token: user.access_token,
      user: {
        name: user.name,
        email: user.email,
      }
    }
  });
});

/* POST Tappay */
router.post("/order/checkout", async function (req, res, next) {
  let accessToken = req.get('Authorization');

  if (!accessToken) {
      res.status(401).send({error: 'Unauthorized'});
      return;
  }

  accessToken = accessToken.replace('Bearer ', '');

  if (accessToken == 'null') {
      res.status(401).send({error: 'Unauthorized'});
      return;
  }

  let user = await promisify(jwt.verify)(accessToken, TOKEN_SECRET);
  req.user = user;
  const userDetail = await stylish.getUserDetail(user.email);
  if (!userDetail) {
      res.status(403).send({error: 'Forbidden'});
  } else {
      req.user.id = userDetail.userID;
  }
  const data = req.body;
  user = req.user;

  if (!data.order || !data.order.total || !data.order.list || !data.prime) {
      res.status(400);
      console.log('Create Order Error: Wrong Data Format');
		return;
	}
  const now = new Date();
  const orderRecord = {
        time: now.getTime(),
        status: -1, // -1 for init (not pay yet)
        total: data.order.total
  };
  orderRecord.user_id = (user && user.id) ? user.id : null;
  const orderId = await stylish.createOrder(orderRecord);
  let paymentResult;
  try {
      paymentResult = await stylish.payOrderByPrime(TAPPAY_PARTNER_KEY, TAPPAY_MERCHANT_ID, data.prime, data.order);
      if (paymentResult.status != 0) {
          res.status(400).send({error: 'Invalid prime'});
          return;
      }
  } catch (err) {
      res.status(400).send({err: err.message});
      return;
  }
  const payment = {
    order_id: orderId,
  };
  await stylish.createPayment(orderId, payment);
  res.send({data: "sucessfully pay"});
});

/* GET orderTotal */
router.get("/order/total", async function (req, res, next) {

  await stylish.insertDashboard();
  const {total} = await stylish.getTotal();
  if (!total) {
    res.status(400).send({error:'Wrong Request'});
    return;
  } 
  res.status(200).json({data:total});
});

module.exports = router;
