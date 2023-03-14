const db = require("./db");
const helper = require("../helper");
const config = require("../config");
// hash password
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const {TOKEN_SECRET} = process.env;
const formatDate = (current_datetime)=>{
    let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds();
    return formatted_date;
}
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { json } = require("express");

/* GET product list */
async function getProductlist(page = 0, category) {
    const offset = helper.getOffset(page, config.listPerPage);

    if(category === "all"){
        const products = await db.query(
            `SELECT *
        FROM stylish.product 
        LIMIT ${offset},${config.listPerPage}`,
        );
        const meta = { page };
        return{
            products,
            meta
        };
    }

    const products = await db.query(
        `SELECT *
    FROM stylish.product 
    WHERE category = ?
    LIMIT ${offset},${config.listPerPage}`,
    [category]
    );
    // const data = helper.emptyOrRows(rows);
    const meta = { page };

    return {
        products,
        meta
    };
}

async function getProductsStock(productIds) {
    const stock = await db.query(
        `SELECT * 
    FROM stylish.product_stock
    WHERE product_id in (${productIds})`
    // ,[productIds]
    );
    return stock;
};

/* GET search product */
async function getSearch(page = 0, search_keyword) {
    const offset = helper.getOffset(page, config.listPerPage);
    const products = await db.query(
        `SELECT *
    FROM stylish.product 
    WHERE title LIKE ?
    LIMIT ${offset},${config.listPerPage}`,
        [search_keyword]
    );
    const meta = { page };

    return {
        products,
        meta,
    };
}

/* GET product detail */
async function getProductDetail(product_id) {
    const detail = await db.query(
        `SELECT *
    FROM stylish.product
    WHERE id = ?`,
    [product_id]
    );
    return {
        detail
    };
}

/* POST create product */
async function create(product, image) {
    // turn detail_image_array paths to string
    // var detail_images_url = "";
    // for (let i = 0; i < detail_image_array.length; i++) {
    //   if (i > 0) detail_images_url += ",";
    //   detail_images_url += detail_image_array[i].path;
    // }

    const result1 = await db.query(
        `INSERT INTO stylish.product
    (category, title, price, basic_info, create_time, imageURL)
    VALUES
    ("${product.category}", "${product.title}", "${product.price}", "${product.basic_info}", "${product.create_time}", "http:54.178.37.192/api/version_1/${image.path}")`
    );

    let message = "Error in creating product";

    if (result1.affectedRows) {
        message = "Product created successfully";
    }

    return { message };
}

/* POST signup */
async function signup(name, email, password) {
    try{
        // await db.query('START TRANSACTION');
        const userID = await db.query(
            `SELECT userID 
        FROM stylish.user 
        WHERE email = ?`,
            [email]
        );
        if (userID.length > 0) {
            // await db.query('COMMIT');
            return {error: 'Email Already Exists'};
        }
      
        const loginAt = new Date();

        // hash password
        const hash = crypto
            .createHash("sha256")
            .update(password)
            .digest("base64");

        const user = {
            email: email,
            password: hash,
            name: name,
        };
        const accessToken = jwt.sign({
            name: user.name,
            email: user.email
        }, TOKEN_SECRET);   
        user.access_token = accessToken;

        const result = await db.query(
            `INSERT INTO stylish.user 
        (name, email, password, access_token, login_at) 
        VALUES 
        ("${user.name}","${user.email}", "${user.password}", "${accessToken}", "${formatDate(loginAt)}")`
        );

        user.id = result.insertId;
        // await db.query('COMMIT');
        return {user};
        
    }catch (error) {
        // await db.query('ROLLBACK');
        return {error};
    }
}

/* POST signin */
async function signin(email, password) {
    try{
        // await db.query('START TRANSACTION');
        const [user] = await db.query('SELECT * FROM stylish.user WHERE email = ?', [email]);
      

        const hash = crypto
            .createHash("sha256")
            .update(password)
            .digest("base64");
        // Confirm that the password is correct
        if (hash !== user.password){
            // await db.query('COMMIT');
            return{error: "User password wrong"};
        }

        const loginAt = new Date();
   
        const accessToken = jwt.sign({
            name: user.name,
            email: user.email
        }, TOKEN_SECRET);

        const queryUser = await db.query(
            `UPDATE stylish.user
        SET access_token = ?, login_at = ?
        WHERE email = ?`,
            [accessToken, formatDate(loginAt), user.email]
        );
        
        // await db.query('COMMIT');

        user.access_token = accessToken;
        return{user};
    }catch(error){
        // await db.query('ROLLBACK');
        return {error};
    }
}

/* POST Tappay */
async function createOrder(order) {
    const result = await db.query(`INSERT INTO stylish.order 
    (time, status, user_id, total) 
    VALUES 
    ("${order.time}","${order.status}", "${order.user_id}", "${order.total}")`);
    return result.insertId;
};

async function createPayment(orderId, payment) {
    try {
        // await db.query('START TRANSACTION');
        await db.query('INSERT INTO stylish.payment SET ?', payment);
        await db.query('UPDATE stylish.order SET status = ? WHERE id = ?', [0, orderId]);
        // await db.query('COMMIT');
        return true;
    } catch (error) {
        // await conn.query('ROLLBACK');
        return {error};
    }
};

async function payOrderByPrime(tappayKey, tappayId, prime, order){
    let res = await fetch ('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', {
        headers: {
            'Content-Type':'application/json',
            'x-api-key': tappayKey
        },
        body: JSON.stringify ({
            'prime': prime,
            'partner_key': tappayKey,
            'merchant_id': tappayId,
            'details': 'Stylish Payment',
            'amount': order.total,
            'cardholder': {
                'phone_number': order.recipient.phone,
                'name': order.recipient.name,
                'email': order.recipient.email
            },
            'remember': false
        }),
        method:'Post'
    }).then((response) => response.json());
    return res;
};

async function getUserDetail(email){
    try {
        const [users] = await db.query('SELECT *FROM stylish.user WHERE email = ?', [email]);
        return users;
        
    } catch (error) {
        console.error(error);
        return null;
    }
};

async function insertDashboard(){
    try {
        let res = await fetch ('http://35.75.145.100:1234/api/1.0/order/data', {
            headers: {
                'Content-Type':'application/json',
            }
        }).then((response) => response.json());
        
        const data = await db.query(
            `SELECT * FROM stylish.neworder `
        );
        if (data.length > 0) {
            return ("Data Already Fetch");
        }
   
        const total = res.map(r => `(${r.total})`);
        const details = res.map((r,i) => (r.list.map(l=>`(${i},${l.id},${l.price},'${l.color.code}','${l.color.name}','${l.size}',${l.qty})`)));
        
        const queryStr = 'INSERT INTO stylish.neworder (total) VALUES '+ total;
        const queryStr1 = 'INSERT INTO stylish.orderdetail (order_id, product_id, price, color_code, color_name, size, qty) VALUES '+ details;
        
        const result = await db.query(queryStr);
        const result1 = await db.query(queryStr1);

        return {total:result,detail:result1};
    } catch (err) {
        console.log(err);
        return {err};
    } 
};
async function getTotal(){
    try{
        const totalRevenue = await db.query('SELECT SUM(total) as total FROM stylish.neworder');
        return {total:totalRevenue[0].total} ;
    }catch(err){
        return{err};
    }
}


module.exports = {
    getProductlist,
    getProductsStock,
    getSearch,
    getProductDetail,
    create,
    signup,
    signin,
    createOrder,
    createPayment,
    payOrderByPrime,
    getUserDetail,
    insertDashboard,
    getTotal
};
